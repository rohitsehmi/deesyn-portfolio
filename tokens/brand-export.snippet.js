/**
 * Reproduces a brand pack's checksum from inside its own Figma file.
 *
 * Paste into the Figma Desktop Bridge plugin console with the brand's file
 * open. It must print the same number `node tokens/verify-brands.mjs` prints
 * for that brand's pack. If it does not, the file and the repo have drifted and
 * one of them is lying about what the brand's colours are.
 *
 * This is the same contract design/figma-export.snippet.js has for components
 * and tokens/figma-export.snippet.js has for the base collection. It is the
 * only thing that makes "Figma and the code agree" a claim rather than a hope,
 * because nothing else in the repo can see inside a Figma file.
 *
 * IT HASHES RESOLVED VALUES, NOT ALIAS PATHS, and that is deliberate. Figma has
 * no notion of our JSON paths, so a checksum over the route to a value could
 * never agree across the two sides; a checksum over the value that comes out
 * can, and it also checks the thing a reader actually sees. Names are lowered
 * and stripped of spaces so `Portfolio/Teal/600` and `portfolio.teal.600`
 * reduce to one key — tokens/brands.mjs applies exactly the same rule.
 *
 * Read-only. It creates and modifies nothing.
 */
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0; return h; };
const norm = (n) => n.toLowerCase().replace(/\s+/g, '').replace(/\./g, '/');
const hx = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
/* Alpha is appended only when it is not 1, matching the 6- and 8-digit hex the
   token files use. Round rather than truncate, or #ffffffb2 comes back b1. */
const toHex = (c) => '#' + hx(c.r) + hx(c.g) + hx(c.b) + (c.a !== undefined && c.a < 1 ? hx(c.a) : '');

/** The group a pack's own primitives live under. */
const PACK_GROUP = 'portfolio/';

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === '01 Primitives');
const sem = cols.find((c) => c.name === '02 Semantic');
if (!prim || !sem) throw new Error('expected collections "01 Primitives" and "02 Semantic"');

const primMode = prim.modes[0].modeId;
const primVars = await Promise.all(prim.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)));
const semVars = await Promise.all(sem.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)));

/* A semantic variable holds an alias; the primitive it points at lives in a
   collection with its own single mode, so follow into that rather than reusing
   the semantic mode id, which does not exist there. */
async function resolveValue(v, modeId) {
  let val = v.valuesByMode[modeId];
  let guard = 0;
  while (val && val.type === 'VARIABLE_ALIAS' && guard++ < 10) {
    const nv = await figma.variables.getVariableByIdAsync(val.id);
    const col = await figma.variables.getVariableCollectionByIdAsync(nv.variableCollectionId);
    val = nv.valuesByMode[col.defaultModeId] ?? nv.valuesByMode[Object.keys(nv.valuesByMode)[0]];
  }
  return val;
}

const lines = [];
for (const v of primVars) {
  if (!norm(v.name).startsWith(PACK_GROUP)) continue;
  lines.push('P|' + norm(v.name) + '|' + toHex(v.valuesByMode[primMode]));
}
for (const m of sem.modes) {
  const tag = m.name === 'Light' ? 'L' : m.name === 'Dark' ? 'D' : null;
  if (!tag) continue;
  for (const v of semVars) {
    if (v.resolvedType !== 'COLOR') continue;
    lines.push(tag + '|' + norm(v.name) + '|' + toHex(await resolveValue(v, m.modeId)));
  }
}

const canonical = lines.sort().join('\n');
console.log('file     :', figma.root.name);
console.log('entries  :', lines.length);
console.log('checksum :', hash(canonical));
console.log('compare with: node tokens/verify-brands.mjs');
return { file: figma.root.name, entries: lines.length, checksum: hash(canonical) };
