/**
 * copy-drafts/<page>.md  ->  src/copy/<page>.json
 *
 * The other half of copy-export.mjs. Reads the `<!-- path -->` markers and
 * writes each block back to that path, preserving the JSON's key order and
 * its `_comment` documentation.
 *
 *   node design/copy-import.mjs --dry                 # show what would change
 *   node design/copy-import.mjs                       # write it
 *   node design/copy-import.mjs making-the-app-testable       # one page
 *
 * Refuses, rather than guesses:
 *
 * - a path that does not already exist in the JSON. Copy files are not created
 *   by editing prose; a typo'd marker is a typo, not a new key.
 * - a path whose current value is not a string.
 * - an empty value over a non-empty one. An empty paragraph reads as a layout
 *   gap rather than as data loss, so nothing on the page would report it. Two
 *   tile summaries went that way once; both sides refuse it now.
 *
 * Anything refused is reported and the rest still writes — one bad marker
 * should not cost you an afternoon of edits.
 *
 * There is no undo here either. The undo is `git diff src/copy/`.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { COPY_DIR, COPY_DRAFTS_DIR } from './paths.mjs';

const IN_DIR = COPY_DRAFTS_DIR;

const dry = process.argv.includes('--dry');
const force = process.argv.includes('--force');
const named = process.argv.slice(2).filter((a) => !a.startsWith('--'));

/** Markers are the only structure that matters; headings are for the reader. */
function parse(md) {
  const out = [];
  const lines = md.split('\n');
  let path = null;
  let buf = [];

  const flush = () => {
    if (path !== null) out.push({ path, value: buf.join('\n').trim().replace(/\s*\n\s*/g, ' ') });
    buf = [];
  };

  for (const line of lines) {
    /*
      The hyphen in the class is load-bearing. Without it this matched nothing
      in studies.md, whose keys are case-study slugs — `machine-readable-
      components.title` and every one of its siblings. The export wrote all 16
      markers correctly and the import recognised none of them, so the file
      reported "0 markers, 0 changed" and wrote nothing.

      That is the exact failure this tool is otherwise careful about: silent.
      Nothing refused, nothing warned, and the only visible symptom was a count
      of zero next to a file that plainly has content. Found 2026-08-10 while
      editing the tile copy, which had been uneditable through the round trip
      since it was written.
    */
    const marker = line.match(/^<!--\s*([A-Za-z0-9_.-]+)\s*-->$/);
    if (marker) {
      flush();
      path = marker[1];
      continue;
    }
    // The instruction block and any other multi-line comment end the run.
    if (/^<!--/.test(line)) { flush(); path = null; continue; }
    if (path !== null && /^#{1,6}\s/.test(line)) { flush(); path = null; continue; }
    if (path !== null) buf.push(line);
  }
  flush();
  return out;
}

const get = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

function set(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const parent = keys.reduce((o, k) => (o == null ? undefined : o[k]), obj);
  if (parent == null) return false;
  parent[last] = value;
  return true;
}

const pages = named.length
  ? named.map((p) => p.replace(/\.md$/, ''))
  : existsSync(IN_DIR)
    ? readdirSync(IN_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : [];

if (!pages.length) {
  console.error(`nothing to import — no .md files in ${IN_DIR}/`);
  process.exit(1);
}

let changedTotal = 0;
let refusedTotal = 0;

for (const page of pages) {
  const mdPath = `${IN_DIR}/${page}.md`;
  const jsonPath = `${COPY_DIR}/${page}.json`;
  if (!existsSync(mdPath)) { console.error(`skip ${page}: no ${mdPath}`); continue; }
  if (!existsSync(jsonPath)) { console.error(`skip ${page}: no ${jsonPath}`); continue; }

  /**
   * A draft older than the JSON it came from is the dangerous case, and it is
   * silent: every string in it still parses, still matches a real key, and
   * still writes — it just writes the version from before the JSON was edited.
   * Caught here because nothing downstream can tell a deliberate rewrite from
   * a stale one.
   *
   * Happened on 2026-08-06: machine-readable-components.md was exported, then
   * the JSON was simplified directly, and an import would have reverted 25
   * strings. The only reason it surfaced was a key that had been deleted in the
   * meantime, so one of the 25 refused and drew attention to the other 24.
   */
  if (statSync(jsonPath).mtimeMs > statSync(mdPath).mtimeMs && !force) {
    console.error(
      `\n${page}  SKIPPED — ${jsonPath} is newer than ${mdPath}.\n` +
        `  The draft was exported before the JSON was last edited, so importing it\n` +
        `  would revert those edits. Re-export and redo your changes, or pass\n` +
        `  --force if the draft really is the version you want.`
    );
    refusedTotal += 1;
    continue;
  }

  const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const entries = parse(readFileSync(mdPath, 'utf8'));

  const changed = [];
  const refused = [];

  for (const { path, value } of entries) {
    const current = get(json, path);
    if (current === undefined) { refused.push([path, 'no such key in the JSON']); continue; }
    if (typeof current !== 'string') { refused.push([path, `not a string (${typeof current})`]); continue; }

    /**
     * Edge whitespace is structural, not writing, so it is carried over from
     * the value being replaced rather than taken from the document.
     *
     * A few strings are deliberate fragments that join around an emphasised
     * span — `process.principle.before` ends in a space, `.after` starts with
     * one — and markdown cannot show that. Exporting then re-importing would
     * trim it and render "at the time:create a hypothesis", two words fused,
     * in the one paragraph on the page with emphasis in it. Invisible in the
     * diff, invisible in the document, obvious only on the page.
     */
    const lead = current.match(/^\s*/)[0];
    const trail = current.match(/\s*$/)[0];
    const padded = value.length ? lead + value + trail : value;

    if (padded === current) continue;
    if (!value.length && current.trim().length) { refused.push([path, 'refusing to blank an existing string']); continue; }
    set(json, path, padded);
    changed.push(path + (lead || trail ? '  (edge spacing preserved)' : ''));
  }

  changedTotal += changed.length;
  refusedTotal += refused.length;

  console.log(`\n${page}  ${entries.length} markers, ${changed.length} changed`);
  for (const p of changed) console.log(`  changed  ${p}`);
  for (const [p, why] of refused) console.log(`  REFUSED  ${p} — ${why}`);

  if (!dry && changed.length) writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n');
}

console.log(
  `\n${changedTotal} string${changedTotal === 1 ? '' : 's'} ${dry ? 'would change' : 'written'}` +
    (refusedTotal ? `, ${refusedTotal} refused` : '')
);
if (dry) console.log('dry run — nothing written. Re-run without --dry.');
else if (changedTotal) console.log('review with: git diff src/copy/');
process.exit(refusedTotal ? 1 : 0);