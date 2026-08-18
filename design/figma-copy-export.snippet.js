/* eslint-disable */
// prettier-ignore
/**
 * The Figma half of the copy round trip.
 *
 * Run via the Figma Console MCP `figma_execute` with the Desktop Bridge plugin
 * open on file UnybX8G5sQIEhLLZN2YFl6. Walks every case-study template on the
 * `Templates` page and returns { "<file>:<path>": "<text>" } for each text node
 * carrying a copy reference in plugin data.
 *
 * Save the result to a file, then:
 *   node design/figma-copy-import.mjs <file.json> --dry
 *   node design/figma-copy-import.mjs <file.json>
 *
 * WHY THIS EXISTS. Editing copy while looking at it laid out — at the real
 * measure, in the real type, with the images beside it — is a different job from
 * editing it in a JSON file or a markdown draft, and it is the one the other two
 * routes are worst at. A sentence that is fine in isolation can still be three
 * words too long for the column it lands in, and nothing but seeing it set will
 * tell you that.
 *
 * THE MATCH IS EXACT, NOT FUZZY. Each text node carries
 * `setPluginData('copy', '<file>:<path>')` — the same string `data-copy` carries
 * on the live page — so a node maps to one JSON key rather than to whichever
 * string looks most similar. That is the same reason the copy is JSON rather
 * than a TS module, and the same reason the markdown round trip writes its paths
 * into HTML comments.
 *
 * A NODE WITH NO REFERENCE IS SKIPPED, not guessed at. Reading time and the
 * "Next" label are computed or structural, and writing them back would bake a
 * derived value into the copy — the trap the hero count and the facts block on
 * /how-this-was-built both avoid.
 *
 * Conflicts are reported rather than silently resolved: the same reference
 * appearing twice with different text means two templates disagree, and picking
 * one at random is how a stale draft overwrites a good edit.
 */
export const SNIPPET = String.raw`
await figma.loadAllPagesAsync();

const tpl = figma.root.children.find(p => p.name === 'Templates');
if (!tpl) return { fatal: 'no Templates page' };

const out = {};
const conflicts = [];

for (const sec of tpl.children) {
  for (const doc of (sec.children || [])) {
    if (!doc.name || !doc.name.startsWith('Case study — desktop')) continue;
    for (const t of doc.findAll(n => n.type === 'TEXT')) {
      const ref = t.getPluginData('copy');
      if (!ref) continue;                       // computed or structural, not copy
      if (out[ref] !== undefined && out[ref] !== t.characters) {
        conflicts.push({ ref, a: out[ref], b: t.characters });
      }
      out[ref] = t.characters;
    }
  }
}

return { refs: Object.keys(out).length, conflicts, copy: out };
`;