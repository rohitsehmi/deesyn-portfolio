/**
 * copy-drafts/<page>.md  ->  src/copy/<page>.json
 *
 * The other half of copy-export.mjs. Reads the `<!-- path -->` markers and
 * writes each block back to that path, preserving the JSON's key order and
 * its `_comment` documentation.
 *
 *   node design/copy-import.mjs --dry                 # show what would change
 *   node design/copy-import.mjs                       # write it
 *   node design/copy-import.mjs contextual-home       # one page
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
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const COPY_DIR = 'src/copy';
const IN_DIR = 'copy-drafts';

const dry = process.argv.includes('--dry');
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
    const marker = line.match(/^<!--\s*([A-Za-z0-9_.]+)\s*-->$/);
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

  const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const entries = parse(readFileSync(mdPath, 'utf8'));

  const changed = [];
  const refused = [];

  for (const { path, value } of entries) {
    const current = get(json, path);
    if (current === undefined) { refused.push([path, 'no such key in the JSON']); continue; }
    if (typeof current !== 'string') { refused.push([path, `not a string (${typeof current})`]); continue; }
    if (value === current) continue;
    if (!value.length && current.length) { refused.push([path, 'refusing to blank an existing string']); continue; }
    set(json, path, value);
    changed.push(path);
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