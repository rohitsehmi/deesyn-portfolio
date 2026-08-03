/**
 * The canonical Figma → figma-export.json snippet.
 *
 * Run this via the Figma Console MCP `figma_execute` with the Desktop Bridge
 * plugin open on file UnybX8G5sQIEhLLZN2YFl6, page "Foundations — Revolut".
 * It returns { P, S, T, E, G, checksum } — paste P/S/T/E/G into the matching
 * keys of figma-export.json, then run `node tokens/build.mjs`.
 *
 * The returned `checksum` uses the same canonical form as verify.mjs. If it
 * matches `node tokens/verify.mjs`, the export is a faithful copy of Figma.
 * Last matched: 2026-08-03, checksum 2816042469, 195 entries.
 *
 * This file is not imported by anything — it is the reference text for a
 * snippet that runs inside Figma's plugin sandbox, where `figma` is global.
 * It exists because an undocumented snippet is an unverifiable one: the
 * font-weight mapping below was reconstructed after a mismatch, and losing it
 * again would silently rewrite all 23 typography tokens.
 */

/* eslint-disable */
// prettier-ignore
export const SNIPPET = String.raw`
const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
const hex = (c, a) => '#' + h(c.r) + h(c.g) + h(c.b) + ((a === undefined || a >= 1) ? '' : h(a));
const key = (n) => n.toLowerCase().replace(/\//g, '.').replace(/\s+/g, '-');

// Figma stores a style name; the export stores a numeric weight. Do not skip
// this map — style names round-trip cleanly but change every typography value.
const WEIGHT = { 'Thin':100, 'Extra Light':200, 'Light':300, 'Regular':400,
  'Medium':500, 'Semi Bold':600, 'Bold':700, 'Extra Bold':800, 'Black':900 };

const colls = await figma.variables.getLocalVariableCollectionsAsync();
const prim = colls.find(c => c.name === '01 Primitives');
const sem  = colls.find(c => c.name === '02 Semantic');
const pMode = prim.modes[0].modeId;
const light = sem.modes.find(m => m.name === 'Light').modeId;
const dark  = sem.modes.find(m => m.name === 'Dark').modeId;

// P — primitives. COLOR to hex (8-digit when alpha < 1), FLOAT and STRING raw.
const byId = {}, P = {};
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  byId[id] = v;
  const raw = v.valuesByMode[pMode];
  P[key(v.name)] = v.resolvedType === 'COLOR' ? hex(raw, raw.a) : raw;
}

// S — semantic, as [lightRef, darkRef] primitive keys. A null means the value
// was hardcoded rather than aliased, which is a build failure.
const S = {};
for (const id of sem.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const ref = (m) => {
    const x = v.valuesByMode[m];
    return (x && x.type === 'VARIABLE_ALIAS') ? key(byId[x.id].name) : null;
  };
  S[key(v.name)] = [ref(light), ref(dark)];
}

// T — text styles: [family, weight, size, lineHeight (unitless), tracking (em)]
const T = {};
for (const s of await figma.getLocalTextStylesAsync()) {
  const lh = s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) / 100 : s.lineHeight.value;
  const ls = s.letterSpacing.unit === 'PERCENT' ? Math.round(s.letterSpacing.value * 100) / 10000 : s.letterSpacing.value;
  T[key(s.name)] = [s.fontName.family, WEIGHT[s.fontName.style], s.fontSize, lh, ls];
}

// E — effect styles: drop shadows only, as [x, y, blur, spread, alpha]
const E = {};
for (const s of await figma.getLocalEffectStylesAsync()) {
  E[key(s.name)] = s.effects.filter(e => e.type === 'DROP_SHADOW')
    .map(e => [e.offset.x, e.offset.y, e.radius, e.spread || 0, Math.round(e.color.a * 1000) / 1000]);
}

// G — gradient paint styles: [position, hex] stops
const G = {};
for (const s of await figma.getLocalPaintStylesAsync()) {
  const p = s.paints[0];
  if (p && p.type && p.type.startsWith('GRADIENT'))
    G[key(s.name)] = p.gradientStops.map(st => [Math.round(st.position * 1000) / 1000, hex(st.color, st.color.a)]);
}

// checksum — must equal verify.mjs. Keep in sync with canonical() there.
const parts = [];
for (const k of Object.keys(P).sort()) parts.push('P|' + k + '|' + P[k]);
for (const k of Object.keys(S).sort()) parts.push('S|' + k + '|' + S[k].join(','));
for (const k of Object.keys(T).sort()) parts.push('T|' + k + '|' + T[k].join(','));
for (const k of Object.keys(E).sort()) parts.push('E|' + k + '|' + E[k].map(l => l.join(',')).join(';'));
for (const k of Object.keys(G).sort()) parts.push('G|' + k + '|' + G[k].map(s => s.join(',')).join(';'));
const str = parts.join('\n');
let hh = 0;
for (let i = 0; i < str.length; i++) hh = (Math.imul(hh, 31) + str.charCodeAt(i)) >>> 0;

return { P, S, T, E, G, entries: parts.length, length: str.length, checksum: hh };
`;
