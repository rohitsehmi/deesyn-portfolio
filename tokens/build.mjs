/**
 * Expands tokens/figma-export.json into tokens/tokens.json (W3C Design Tokens format).
 *
 *   node tokens/build.mjs
 *
 * To refresh figma-export.json from Figma, run the snippet in
 * tokens/figma-export.snippet.js via the Figma Console MCP (`figma_execute`)
 * with the Desktop Bridge plugin open, and paste the result into the
 * P / S / T / E / G keys of figma-export.json. It also returns a checksum that
 * must match `node tokens/verify.mjs`.
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

/** Motion groups. Figma has no duration or cubicBezier variable type, so these
 *  live as raw numbers (ms) and CSS easing strings and are expanded here. */
const DURATION = new Set(['duration']);
const EASING = new Set(['easing']);

/** "cubic-bezier(0.23, 1, 0.32, 1)" -> [0.23, 1, 0.32, 1]. "linear" is the
 *  identity curve; DTCG has no `linear` keyword, so express it as one. */
function toCubicBezier(value) {
  if (value === 'linear') return [0, 0, 1, 1];
  const m = /^cubic-bezier\(([^)]+)\)$/.exec(value);
  if (!m) throw new Error(`easing value is neither linear nor cubic-bezier(): ${value}`);
  const nums = m[1].split(',').map((n) => Number(n.trim()));
  if (nums.length !== 4 || nums.some(Number.isNaN)) throw new Error(`bad cubic-bezier: ${value}`);
  return nums;
}

/** DTCG $type for a token, from its group prefix. */
function typeOf(key) {
  const group = key.split('.')[0];
  if (DIMENSION.has(group)) return 'dimension';
  if (DURATION.has(group)) return 'duration';
  if (EASING.has(group)) return 'cubicBezier';
  return 'color';
}

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
  const $type = typeOf(key);
  const $value =
    $type === 'dimension' ? `${value}px`
    : $type === 'duration' ? `${value}ms`
    : $type === 'cubicBezier' ? toCubicBezier(value)
    : value;
  set(out.primitive, key, { $type, $value });
}

// ---- semantic (light / dark), aliased back to primitives -----------------
// Motion tokens are mode-independent: both modes alias the same primitive.
for (const [key, [light, dark]] of Object.entries(src.S)) {
  const $type = typeOf(key);
  set(out.semantic.light, key, { $type, $value: `{primitive.${light}}` });
  set(out.semantic.dark, key, { $type, $value: `{primitive.${dark}}` });
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
