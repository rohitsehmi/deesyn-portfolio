/**
 * Run inside Figma (Desktop Bridge plugin console, file "Revolut") to reproduce
 * design/banding-export.json and its checksum from the live plugin data.
 *
 * Matched 2026-08-05: checksum 2143010685, 7 rules, canonical length 3193.
 *
 * The four `_`-prefixed keys at the top of banding-export.json are added when
 * the export lands in the repo — they are not in Figma's stored spec. canonical()
 * skips them, which is why re-exporting on a new date does not move the number.
 * Put them back after pasting, or verify-bands prints the page name as undefined.
 *
 * If the number this prints differs from what `node design/verify-bands.mjs`
 * prints, Figma and the repo have drifted. Re-export rather than editing the
 * JSON by hand: the file is measured, and hand-editing makes it authored.
 *
 * `canonical` and `hash` are duplicated here rather than imported because the
 * plugin sandbox has no module system. They must stay identical to
 * design/hash.mjs and the canonical() in design/verify-bands.mjs.
 */
await figma.loadAllPagesAsync();
const page = figma.root.children.find((p) => p.name === 'Banding');
if (!page) throw new Error('no page named "Banding"');

const raw = page.getSharedPluginData('banding', 'spec');
if (!raw) throw new Error('no banding spec on that page');
const spec = JSON.parse(raw);

/** Metadata keys are excluded, so re-exporting on a new date is not a change. */
function canonical(v) {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).filter((k) => !k.startsWith('_')).sort()
      .map((k) => k + ':' + canonical(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h;
}

const str = canonical(spec);
return {
  rules: spec.rules.length,
  roles: Object.keys(spec.roles),
  length: str.length,
  checksum: hash(str),
  json: JSON.stringify(spec, null, 2)   // paste into design/banding-export.json
};
