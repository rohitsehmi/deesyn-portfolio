/**
 * The canonical Figma → design/figma-export.json snippet.
 *
 * Run via the Figma Console MCP `figma_execute` with the Desktop Bridge plugin
 * open on file UnybX8G5sQIEhLLZN2YFl6. It walks the Icons, Marks and Components
 * pages, and does two things:
 *
 *   1. writes each component set's own contract back onto it, as
 *      setSharedPluginData('spec', 'contract', json) — so the spec lives beside
 *      the component in Figma, not in one page-level blob;
 *   2. returns the combined export plus a checksum. Paste the export into
 *      design/figma-export.json, then run `node design/build.mjs`.
 *
 * Matching checksum against `node design/verify.mjs` means the repo is a
 * faithful mirror. Last matched: 2026-08-03, checksum 4183560310, 127 entries,
 * 11 components / 92 variants / 67 token sets.
 *
 * This reads BOUND VARIABLES off the nodes. It does not trust plugin data or
 * anything hand-written — which is why verify.mjs also asserts no literals.
 *
 * One exception: a set carrying setSharedPluginData('spec','status','deprecated')
 * is left out of the contract and listed under `deprecated` instead. It stays
 * in the Figma file; it just stops being part of what the repo publishes. That
 * is also what resolves name collisions, since the export keys by set name and
 * two sets sharing one silently overwrite each other.
 *
 * Not imported by anything; reference text for code that runs inside Figma's
 * plugin sandbox, where `figma` is global.
 */

/* eslint-disable */
// prettier-ignore
export const SNIPPET = String.raw`
await figma.loadAllPagesAsync();

const colls = await figma.variables.getLocalVariableCollectionsAsync();
const varName = {};
for (const c of colls) for (const id of c.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  varName[id] = v.name;
}
const styleName = {};
for (const s of await figma.getLocalTextStylesAsync()) styleName[s.id] = s.name;

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

function contractFor(set) {
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
      const p = pathOf(n, c), b = bind(n);
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
  return { description: set.description || '', props, variants };
}

// domains mirror Figma pages one-to-one
const PAGES = { icons: 'Icons', marks: 'Marks', components: 'Components' };
const domains = {};
// Superseded sets stay in the file but leave the published contract. Recorded
// rather than skipped in silence: a component vanishing from the export with
// no trace is indistinguishable from one that was deleted by accident.
const deprecated = [];
for (const [domain, pageName] of Object.entries(PAGES)) {
  const page = figma.root.children.find(p => p.name === pageName);
  domains[domain] = { page: pageName, components: {} };
  for (const set of page.findAll(n => n.type === 'COMPONENT_SET')) {
    if (set.getSharedPluginData('spec', 'status') === 'deprecated') {
      deprecated.push({ domain, name: set.name, id: set.id, variants: set.children.length });
      continue;
    }
    const c = contractFor(set);
    domains[domain].components[set.name] = c;
    // the spec lives beside the component, not in a page-level blob
    set.setSharedPluginData('spec', 'contract', JSON.stringify({
      component: set.name, variantCount: set.children.length, ...c,
      tokenSets: Object.values(c.variants).map(v => pool[v.t])
    }));
  }
}

// checksum — keep in sync with canonical() in verify.mjs
const flat = [];
for (const [domain, d] of Object.entries(domains))
  for (const name of Object.keys(d.components)) flat.push([domain, name, d.components[name]]);
flat.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
const parts = [];
for (const [domain, name, c] of flat) {
  for (const k of Object.keys(c.props).sort()) {
    const p = c.props[k];
    parts.push('P|' + domain + '|' + name + '|' + k + '|' + p.type + '|' + (p.values || []).join(','));
  }
  for (const vn of Object.keys(c.variants).sort()) {
    const v = c.variants[vn], set = pool[v.t];
    const f = Object.keys(set).sort().map(n =>
      n + '{' + Object.keys(set[n]).sort().map(p => p + '=' + set[n][p]).join(',') + '}').join(';');
    parts.push('V|' + domain + '|' + name + '|' + vn + '|' + v.size.join('x') + '|' + f);
  }
}
const str = parts.join('\n');
let h = 0; for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;

return { domains, deprecated, tokenSets: pool, entries: parts.length, length: str.length, checksum: h };
`;
