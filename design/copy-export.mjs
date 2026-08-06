/**
 * src/copy/<page>.json  ->  copy-drafts/<page>.md
 *
 * A page's copy as one editable document, for the times the in-browser editor
 * is too bitty — rewriting a whole study means seeing it whole, and a field at
 * a time is the wrong instrument for that.
 *
 * The format is prose with an HTML comment above each string carrying its JSON
 * path. The comment is the marker `copy-import.mjs` reads, so the round trip is
 * exact rather than a fuzzy match on similar-looking sentences. Rendered as
 * markdown the comments vanish; in an editor they read as quiet labels.
 *
 *   node design/copy-export.mjs                      # every page
 *   node design/copy-export.mjs making-the-app-testable ...  # named pages
 *
 * Keys beginning `_` are documentation for whoever opens the JSON, not copy,
 * and are skipped. Their content is repeated at the top of the document
 * instead, where it is guidance rather than a string to edit.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';

const COPY_DIR = 'src/copy';
const OUT_DIR = 'copy-drafts';

/** Walk to leaf strings, in file order, skipping `_`-prefixed documentation. */
function leaves(node, path = [], out = []) {
  if (typeof node === 'string') {
    out.push({ path: path.join('.'), value: node });
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => leaves(v, [...path, i], out));
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_')) continue;
      leaves(v, [...path, k], out);
    }
  }
  return out;
}

/** "problem.paras.0" -> "Problem". Section headings only, from the first key. */
const heading = (key) =>
  key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

function toMarkdown(page, json) {
  const notes = [];
  const collectNotes = (node, path = []) => {
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_') && typeof v === 'string') {
        notes.push({ where: path.join('.') || 'this file', text: v });
      } else if (v && typeof v === 'object') {
        collectNotes(v, [...path, k]);
      }
    }
  };
  collectNotes(json);

  const lines = [
    `# ${page}`,
    '',
    '<!--',
    '  HOW TO EDIT THIS FILE',
    '',
    '  Change the text under each marker. Leave the `<!-- path -->` markers',
    '  exactly as they are — they are how the text finds its way back into',
    '  src/copy/' + page + '.json, and a changed or deleted one loses its string.',
    '',
    '  Hard-wrap freely. Lines under one marker are rejoined into a single',
    '  paragraph on import, so where you break a line does not matter.',
    '',
    '  To leave something as it is, leave it alone. Import only writes back the',
    '  strings that actually changed.',
    '',
    '  Do not delete a whole block to remove a string. An empty value is refused',
    '  on import, because a blank paragraph reads as a layout gap rather than as',
    '  data loss, which is how two summaries were silently lost once already.',
    '-->',
    ''
  ];

  if (notes.length) {
    lines.push('## Notes from the JSON', '');
    for (const n of notes) {
      lines.push(`- **${n.where}** — ${n.text}`, '');
    }
  }

  let section = null;
  for (const { path, value } of leaves(json)) {
    const top = path.split('.')[0];
    if (top !== section) {
      section = top;
      lines.push('', `## ${heading(top)}`, '');
    }
    lines.push(`<!-- ${path} -->`, value, '');
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimStart() + '\n';
}

const requested = process.argv.slice(2);
const pages = requested.length
  ? requested.map((p) => p.replace(/\.json$/, ''))
  : readdirSync(COPY_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

mkdirSync(OUT_DIR, { recursive: true });

for (const page of pages) {
  const json = JSON.parse(readFileSync(`${COPY_DIR}/${page}.json`, 'utf8'));
  const md = toMarkdown(page, json);
  writeFileSync(`${OUT_DIR}/${page}.md`, md);
  const count = leaves(json).length;
  const gaps = leaves(json).filter((l) => l.value.includes('[NEEDS')).length;
  console.log(
    `${OUT_DIR}/${page}.md`.padEnd(44) +
      `${String(count).padStart(3)} strings` +
      (gaps ? `, ${gaps} still marked [NEEDS:]` : '')
  );
}