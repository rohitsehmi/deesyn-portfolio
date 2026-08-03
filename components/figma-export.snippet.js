/**
 * The canonical Figma → components/figma-export.json snippet.
 *
 * Run via the Figma Console MCP `figma_execute` with the Desktop Bridge plugin
 * open on file UnybX8G5sQIEhLLZN2YFl6, page "Components". It returns the whole
 * export plus a checksum — paste the export into components/figma-export.json,
 * then run `node components/build.mjs`.
 *
 * If the returned checksum matches `node components/verify.mjs`, the repo is a
 * faithful mirror of the Figma file. Last matched: 2026-08-03, checksum
 * 2019599942, 11 components / 92 variants / 67 token sets.
 *
 * This reads BOUND VARIABLES off the nodes — it does not trust plugin data or
 * anything hand-written. If a value was hardcoded in Figma it simply will not
 * appear, which is why verify.mjs also asserts there are no literals.
 *
 * Not imported by anything; it is reference text for code that runs inside
 * Figma's plugin sandbox, where `figma` is global.
 */

/* eslint-disable */
// prettier-ignore
export const SNIPPET = String.raw`
const page = figma.root.children.find(p => p.name === 'Components');
await figma.setCurrentPageAsync(page);

const colls = await figma.variables.getLocalVariableCollectionsAsync();
const varName = {};
for (const c of colls) for (const id of c.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  varName[id] = v.name;
}
const styleName = {};
for (const s of await figma.getLocalTextStylesAsync()) styleName[s.id] = s.name;

// resolve every bound variable on a node to its token NAME
function bind(n) {
  const o = {}, bv = n.boundVariables || {};
  for (const [k, val] of Object.entries(bv)) {
    if (k === 'fills' || k === 'strokes') {
      const a = Array.isArray(val) ? val : [val];
      const names = a.map(x => varName[x.id]).filter(Boolean);
      if (names.length) o[k] = names[0];
    } else if (val && val.id && varName[val.id]) o[k] = varName[val.id];
  }
  return o;
}
const pathOf = (n, root) => { const p = []; let c = n; while (c && c !== root) { p.unshift(c.name); c = c.parent; } return p.join('/') || '.'; };

// lossless compaction: four equal corners -> radius, equal L/R -> paddingX, etc.
function compact(map) {
  const out = {};
  for (const [node, b] of Object.entries(map)) {
    const o = { ...b };
    const R = ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'];
    if (R.every(k => o[k]) && new Set(R.map(k => o[k])).size === 1) { o.radius = o[R[0]]; R.forEach(k => delete o[k]); }
    if (o.paddingLeft && o.paddingLeft === o.paddingRight) { o.paddingX = o.paddingLeft; delete o.paddingLeft; delete o.paddingRight; }
    if (o.paddingTop && o.paddingTop === o.paddingBottom) { o.paddingY = o.paddingTop; delete o.paddingTop; delete o.paddingBottom; }
    if (o.itemSpacing) { o.gap = o.itemSpacing; delete o.itemSpacing; }
    if (o.fills) { o.bg = o.fills; delete o.fills; }
    if (o.strokes) { o.border = o.strokes; delete o.strokes; }
    out[node] = o;
  }
  return out;
}

const pool = [], poolKey = new Map();
const intern = (o) => { const s = JSON.stringify(o); if (!poolKey.has(s)) { poolKey.set(s, pool.length); pool.push(o); } return poolKey.get(s); };

const components = {};
for (const set of page.findAll(n => n.type === 'COMPONENT_SET')) {
  const defs = set.componentPropertyDefinitions || {};
  const props = {};
  for (const [k, d] of Object.entries(defs)) {
    const key = k.replace(/#\d+:\d+$/, '');
    props[key] = d.type === 'VARIANT'
      ? { type: 'VARIANT', values: d.variantOptions }
      : { type: d.type, ...(d.type === 'TEXT' || d.type === 'BOOLEAN' ? { default: d.defaultValue } : {}) };
  }
  const variants = {};
  for (const c of set.children) {
    const map = {};
    for (const n of [c, ...c.findAll(() => true)]) {
      const p = pathOf(n, c);
      const b = bind(n);
      if (Object.keys(b).length) map[p] = b;
      if (n.type === 'TEXT') {
        map[p] = map[p] || {};
        if (styleName[n.textStyleId]) map[p].textStyle = styleName[n.textStyleId];
        if (n.textDecoration && n.textDecoration !== 'NONE') map[p].textDecoration = n.textDecoration;
      }
    }
    const c2 = compact(map);
    // on text and vector nodes a fill is really the foreground
    for (const [k, o] of Object.entries(c2)) if (o.bg && (o.textStyle || /Vector$/.test(k))) { o.fg = o.bg; delete o.bg; }
    variants[c.name] = { size: [Math.round(c.width), Math.round(c.height)], t: intern(c2) };
  }
  components[set.name] = { description: set.description || '', props, variants };
}

// checksum — keep in sync with canonical() in verify.mjs
const parts = [];
for (const name of Object.keys(components).sort()) {
  const c = components[name];
  for (const k of Object.keys(c.props).sort()) {
    const d = c.props[k];
    parts.push('P|' + name + '|' + k + '|' + d.type + '|' + (d.values || []).join(','));
  }
  for (const vn of Object.keys(c.variants).sort()) {
    const v = c.variants[vn], set = pool[v.t];
    const flat = Object.keys(set).sort().map(node =>
      node + '{' + Object.keys(set[node]).sort().map(p => p + '=' + set[node][p]).join(',') + '}').join(';');
    parts.push('V|' + name + '|' + vn + '|' + v.size.join('x') + '|' + flat);
  }
}
const str = parts.join('\n');
let h = 0; for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;

return { components, tokenSets: pool, entries: parts.length, length: str.length, checksum: h };
`;
