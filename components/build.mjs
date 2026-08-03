/**
 * Expands components/figma-export.json into one spec file per component.
 *
 *   node components/build.mjs
 *
 * Writes, for each component:
 *   components/specs/<slug>.json  — machine-readable contract, tokens resolved to values
 *   components/specs/<slug>.md    — the same thing, readable
 * plus components/index.json — the roll-up.
 *
 * The export stores TOKEN NAMES, not literals. This resolves each one against
 * tokens/tokens.json so a spec file carries both: the token to reference, and
 * the value it currently resolves to in each mode. Code should consume the
 * token, never the literal — the literal is there so a reviewer can sanity-check
 * without opening Figma.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const src = JSON.parse(readFileSync(join(here, 'figma-export.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(join(root, 'tokens', 'tokens.json'), 'utf8'));

/** "Size/Button lg" -> "size.button-lg" (same rule the token export uses). */
export const tokenKey = (name) => name.toLowerCase().replace(/\//g, '.').replace(/\s+/g, '-');

const PRIMITIVE_GROUPS = new Set([
  'brand', 'neutral', 'accent', 'status', 'premium', 'metal', 'alpha',
  'space', 'layout', 'radius', 'size', 'breakpoint', 'duration', 'easing'
]);

const dig = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/** Resolve a Figma token name to its DTCG entry (and the value per mode). */
export function resolveToken(name) {
  const key = tokenKey(name);
  const group = key.split('.')[0];

  if (PRIMITIVE_GROUPS.has(group)) {
    const node = dig(tokens.primitive, key);
    if (!node) return null;
    return { ref: `primitive.${key}`, type: node.$type, value: node.$value };
  }
  // semantic lives per mode
  const light = dig(tokens.semantic.light, key);
  const dark = dig(tokens.semantic.dark, key);
  if (!light || !dark) return null;
  const deref = (n) => {
    const m = /^\{(.+)\}$/.exec(n.$value);
    if (!m) return n.$value;
    const target = dig(tokens, m[1]);
    return target ? target.$value : n.$value;
  };
  return { ref: `semantic.*.${key}`, type: light.$type, light: deref(light), dark: deref(dark) };
}

/** Text styles resolve into the typography group. */
export function resolveTextStyle(name) {
  const node = dig(tokens.typography, tokenKey(name));
  return node ? { ref: `typography.${tokenKey(name)}`, ...node.$value } : null;
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Expand one variant's token indices into a resolved contract. */
function expand(entry) {
  const set = src.tokenSets[entry.t];
  const out = {};
  for (const [node, binds] of Object.entries(set)) {
    const resolved = {};
    for (const [prop, tokenName] of Object.entries(binds)) {
      if (prop === 'textStyle') {
        resolved.textStyle = { token: tokenName, ...(resolveTextStyle(tokenName) || {}) };
      } else if (prop === 'textDecoration') {
        resolved.textDecoration = tokenName;
      } else {
        const r = resolveToken(tokenName);
        resolved[prop] = r ? { token: tokenName, ...r } : { token: tokenName, UNRESOLVED: true };
      }
    }
    out[node] = resolved;
  }
  return out;
}

// verify.mjs imports the resolvers above; only build when run directly.
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (!isMain) { /* imported for resolveToken / resolveTextStyle */ }
else build();

function build() {
const specsDir = join(here, 'specs');
rmSync(specsDir, { recursive: true, force: true });
mkdirSync(specsDir, { recursive: true });

const index = { $description: 'Component contracts, generated from Figma. Do not edit by hand — run node components/build.mjs.', generated: src._exported, components: [] };

for (const [name, c] of Object.entries(src.components)) {
  const s = slug(name);
  const variantAxes = Object.fromEntries(
    Object.entries(c.props).filter(([, d]) => d.type === 'VARIANT').map(([k, d]) => [k, d.values]));
  const otherProps = Object.fromEntries(
    Object.entries(c.props).filter(([, d]) => d.type !== 'VARIANT'));

  const spec = {
    name,
    slug: s,
    figma: { file: 'UnybX8G5sQIEhLLZN2YFl6', page: 'Components', set: name },
    description: c.description,
    variantAxes,
    props: otherProps,
    slots: Object.entries(c.props).filter(([, d]) => d.type === 'SLOT').map(([k]) => k),
    variantCount: Object.keys(c.variants).length,
    variants: Object.fromEntries(Object.entries(c.variants).map(([vn, v]) => [
      vn, { size: { width: v.size[0], height: v.size[1] }, tokens: expand(v) }
    ]))
  };
  writeFileSync(join(specsDir, `${s}.json`), JSON.stringify(spec, null, 2) + '\n');

  // readable companion
  const md = [];
  md.push(`# ${name}`, '');
  md.push(c.description.split('\n').filter(Boolean).join('\n\n'), '');
  md.push(`Figma: file \`UnybX8G5sQIEhLLZN2YFl6\`, page **Components**, set \`${name}\`. ${spec.variantCount} variants.`, '');
  if (Object.keys(variantAxes).length) {
    md.push('## Variant axes', '');
    md.push('| Axis | Values |', '|---|---|');
    for (const [k, v] of Object.entries(variantAxes)) md.push(`| \`${k}\` | ${v.map(x => `\`${x}\``).join(' · ')} |`);
    md.push('');
  }
  if (Object.keys(otherProps).length) {
    md.push('## Properties', '');
    md.push('| Property | Type | Default |', '|---|---|---|');
    for (const [k, d] of Object.entries(otherProps))
      md.push(`| \`${k}\` | ${d.type} | ${d.default === undefined ? '—' : `\`${JSON.stringify(d.default)}\``} |`);
    md.push('');
  }
  md.push('## Token contract', '');
  md.push('Every value below is a token reference, not a literal. `.` is the component root.', '');
  const seen = new Set();
  for (const [vn, v] of Object.entries(c.variants)) {
    if (seen.has(v.t)) continue;
    seen.add(v.t);
    const sharedBy = Object.entries(c.variants).filter(([, x]) => x.t === v.t).map(([n]) => n);
    md.push(`### ${sharedBy.join(' · ')}`, '');
    md.push('| Node | Property | Token |', '|---|---|---|');
    for (const [node, binds] of Object.entries(src.tokenSets[v.t]))
      for (const [prop, tok] of Object.entries(binds))
        md.push(`| \`${node}\` | ${prop} | \`${tok}\` |`);
    md.push('');
  }
  writeFileSync(join(specsDir, `${s}.md`), md.join('\n'));

  index.components.push({ name, slug: s, variants: spec.variantCount,
    axes: Object.keys(variantAxes), slots: spec.slots,
    spec: `components/specs/${s}.json`, doc: `components/specs/${s}.md` });
}

writeFileSync(join(here, 'index.json'), JSON.stringify(index, null, 2) + '\n');

console.log('component specs written');
console.table(index.components.map(c => ({ component: c.name, variants: c.variants, slots: c.slots.length })));
}
