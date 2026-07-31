/**
 * Expands tokens/figma-export.json into tokens/tokens.json (W3C Design Tokens format).
 *
 *   node tokens/build.mjs
 *
 * To refresh figma-export.json from Figma, run this via the Figma Console MCP
 * (`figma_execute`) with the Desktop Bridge plugin open, and paste the result
 * into the P / S / T / E / G keys of figma-export.json:
 *
 *   const colls = await figma.variables.getLocalVariableCollectionsAsync();
 *   const prim = colls.find(c => c.name === '01 Primitives');
 *   const sem  = colls.find(c => c.name === '02 Semantic');
 *   ... (see docs/revolut-design-foundations.md for the full snippet)
 *
 * Token types follow https://tr.designtokens.org/format/
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(readFileSync(join(here, 'figma-export.json'), 'utf8'));

/** Turn "a.b.c" -> nested object, setting the leaf. */
function set(root, path, leaf) {
  const parts = path.split('.');
  let node = root;
  for (const p of parts.slice(0, -1)) node = node[p] ??= {};
  node[parts.at(-1)] = leaf;
}

/** Primitive groups that are lengths rather than colours. */
const DIMENSION = new Set(['space', 'layout', 'radius', 'size', 'breakpoint']);

const out = {
  $description:
    'Revolut-matched design tokens for the case-study portfolio. Values verified against revolut.com live CSS, not eyedropped. See docs/revolut-design-foundations.md.',
  primitive: {},
  semantic: { light: {}, dark: {} },
  typography: {},
  shadow: {},
  gradient: {}
};

// ---- primitives ----------------------------------------------------------
for (const [key, value] of Object.entries(src.P)) {
  const group = key.split('.')[0];
  const isDimension = DIMENSION.has(group);
  set(out.primitive, key, {
    $type: isDimension ? 'dimension' : 'color',
    $value: isDimension ? `${value}px` : value
  });
}

// ---- semantic (light / dark), aliased back to primitives -----------------
for (const [key, [light, dark]] of Object.entries(src.S)) {
  set(out.semantic.light, key, { $type: 'color', $value: `{primitive.${light}}` });
  set(out.semantic.dark, key, { $type: 'color', $value: `{primitive.${dark}}` });
}

// ---- typography ----------------------------------------------------------
for (const [key, [family, weight, size, lineHeight, tracking]] of Object.entries(src.T)) {
  set(out.typography, key, {
    $type: 'typography',
    $value: {
      fontFamily: family,
      fontWeight: weight,
      fontSize: `${size}px`,
      lineHeight, // unitless multiplier
      letterSpacing: tracking === 0 ? '0' : `${tracking}em`
    }
  });
}

// ---- shadows -------------------------------------------------------------
// Source keys already carry their group prefix ("shadow.level-1"); strip it so
// we don't end up with shadow.shadow.level-1.
const strip = (key, group) => (key.startsWith(group + '.') ? key.slice(group.length + 1) : key);

for (const [key, layers] of Object.entries(src.E)) {
  set(out.shadow, strip(key, 'shadow'), {
    $type: 'shadow',
    $value: layers.map(([x, y, blur, spread, alpha]) => ({
      offsetX: `${x}px`,
      offsetY: `${y}px`,
      blur: `${blur}px`,
      spread: `${spread}px`,
      color: `rgba(0, 0, 0, ${alpha})`
    }))
  });
}

// ---- gradients -----------------------------------------------------------
for (const [key, stops] of Object.entries(src.G)) {
  set(out.gradient, strip(key, 'gradient'), {
    $type: 'gradient',
    $value: stops.map(([position, color]) => ({ position, color }))
  });
}

writeFileSync(join(here, 'tokens.json'), JSON.stringify(out, null, 2) + '\n');

const count = (o) =>
  Object.values(o).reduce((n, v) => n + (v && v.$value !== undefined ? 1 : count(v)), 0);

console.log('tokens.json written');
console.table({
  primitive: count(out.primitive),
  'semantic.light': count(out.semantic.light),
  'semantic.dark': count(out.semantic.dark),
  typography: count(out.typography),
  shadow: count(out.shadow),
  gradient: count(out.gradient)
});
