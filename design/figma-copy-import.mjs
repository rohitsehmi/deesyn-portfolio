#!/usr/bin/env node
/**
 * Writes copy edited in Figma back into src/copy/*.json.
 *
 * A third way into the same words. The browser editor is right for one sentence,
 * the markdown round trip is right for rewriting a whole page's voice, and this
 * is right for the case the other two are bad at: editing copy while looking at
 * it laid out, at the real measure, in the real type, with the images beside it.
 *
 * HOW THE MATCH IS MADE, and it is the same mechanism as the other two rather
 * than a new one. Every text node in the Figma template carries
 * `setPluginData('copy', '<file>:<path>')` — exactly the string `data-copy`
 * carries on the live page. So the round trip is exact rather than a fuzzy match
 * on similar-looking sentences, which is the reason copy is JSON and not a TS
 * module in the first place.
 *
 *   1. In Figma, run design/figma-copy-export.snippet.js. It walks the
 *      Templates page and returns { "<file>:<path>": "<text>", ... }.
 *   2. Save that JSON to a file.
 *   3. node design/figma-copy-import.mjs <file.json> [--dry]
 *
 * THE GUARDS ARE THE SAME AS copy-import.mjs, deliberately, because the failure
 * modes are identical and one of them has already cost real work here:
 *
 *   - a path that does not already exist is REFUSED. A typo'd marker is a typo,
 *     not a new key.
 *   - a path whose current value is not a string is refused.
 *   - an EMPTY value over a non-empty one is refused. A blank paragraph reads as
 *     a layout gap rather than as data loss, so nothing on the page reports it.
 *   - edge whitespace is carried over from the value being replaced, never taken
 *     from Figma. A few strings are deliberate fragments that join around an
 *     emphasised span, and a text node cannot show a trailing space.
 *
 * It REFUSES rather than guesses, and reports what it refused while still
 * writing everything else — one bad marker should not cost an afternoon of
 * edits. The undo is `git diff src/copy/`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { COPY_DIR } from './paths.mjs';

const root = new URL('../', import.meta.url).pathname;
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const input = args.find((a) => !a.startsWith('--'));

if (!input) {
  console.error('\nusage: node design/figma-copy-import.mjs <export.json> [--dry]\n');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`\nno such file: ${input}\n`);
  process.exit(1);
}

const incoming = JSON.parse(readFileSync(input, 'utf8'));
const files = new Map();
const load = (name) => {
  if (!files.has(name)) {
    const path = `${root}${COPY_DIR}/${name}.json`;
    if (!existsSync(path)) return null;
    files.set(name, { path, data: JSON.parse(readFileSync(path, 'utf8')), changed: 0 });
  }
  return files.get(name);
};

/** Walks a dotted path, refusing to create anything that is not already there. */
function resolve(obj, path) {
  const parts = path.split('.');
  let node = obj;
  for (const p of parts.slice(0, -1)) {
    if (node == null || !Object.prototype.hasOwnProperty.call(node, p)) return null;
    node = node[p];
  }
  const key = parts[parts.length - 1];
  if (node == null || !Object.prototype.hasOwnProperty.call(node, key)) return null;
  return { node, key };
}

const refused = [];
let changed = 0, same = 0;

for (const [ref, rawText] of Object.entries(incoming)) {
  const [fileName, path] = ref.split(':');
  if (!fileName || !path) { refused.push(`${ref} — not a <file>:<path> reference`); continue; }

  const file = load(fileName);
  if (!file) { refused.push(`${ref} — no such copy file`); continue; }

  const target = resolve(file.data, path);
  if (!target) { refused.push(`${ref} — path does not exist (a typo is a typo, not a new key)`); continue; }

  const current = target.node[target.key];
  if (typeof current !== 'string') { refused.push(`${ref} — current value is not a string`); continue; }

  const text = String(rawText);
  if (!text.trim() && current.trim()) { refused.push(`${ref} — refusing to blank a non-empty string`); continue; }

  // Edge whitespace belongs to the JSON, not to what Figma could render.
  const lead = current.match(/^\s*/)[0];
  const trail = current.match(/\s*$/)[0];
  const next = lead + text.trim() + trail;

  if (next === current) { same++; continue; }
  target.node[target.key] = next;
  file.changed++;
  changed++;
}

console.log('');
for (const [name, f] of files) {
  if (!f.changed) { console.log(`  ${name}.json — no change`); continue; }
  if (!dry) writeFileSync(f.path, JSON.stringify(f.data, null, 2) + '\n');
  console.log(`  ${name}.json — ${f.changed} string${f.changed > 1 ? 's' : ''}${dry ? ' (dry run)' : ' written'}`);
}
if (refused.length) {
  console.log(`\nrefused ${refused.length}:`);
  refused.forEach((r) => console.log(`  ${r}`));
}
console.log(`\n${changed} changed, ${same} identical, ${refused.length} refused${dry ? '  — DRY RUN, nothing written' : ''}`);
console.log('undo is `git diff src/copy/`\n');