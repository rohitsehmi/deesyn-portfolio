/**
 * Brand packs: loaded, resolved and checksummed in one place.
 *
 * tokens/css.mjs emits from this, tokens/verify-brands.mjs checks it, and
 * tokens/brand-export.snippet.js reproduces the same checksum from inside a
 * Figma file. Three consumers, one implementation — which is the whole lesson
 * of design/counts.mjs and design/component-specs.mjs, both of which exist
 * because this repo had already shipped the same rule twice and watched the
 * copies drift.
 *
 * WHAT A PACK IS. It extends the base collection and replaces nothing. Its
 * primitives are additive, and its semantic layer re-points the same names
 * every component already binds to, so adding a brand changes no component, no
 * band and no stylesheet. Anything a pack says nothing about — the alphas, the
 * status colours, the durations — keeps the base value, which is why a pack is
 * a short file rather than a second design system.
 *
 * ONE PACK CAN SERVE SEVERAL BRANDS. `brands: ['wise', 'healf']` emits one rule
 * per brand from one set of values. Wise and Healf were given identical ramps,
 * and three byte-identical pack files would be exactly the hand-maintained
 * duplication every check in design/ exists to stop. `brand: 'x'` is still
 * accepted for a pack that serves one.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash } from '../design/hash.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const BRANDS_DIR = join(here, 'brands');

const base = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));

/** Deep merge where a DTCG leaf ($value) replaces rather than merges. */
export const merge = (a, b) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b ?? {})) {
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v) && v.$value === undefined
        ? merge(a?.[k] ?? {}, v)
        : v;
  }
  return out;
};

const dig = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

/** Follow {aliases} to a literal. Throws rather than returning undefined. */
export function resolve(value, tree, seen = 0) {
  if (seen > 10) throw new Error(`alias loop at ${value}`);
  const m = /^\{(.+)\}$/.exec(value);
  if (!m) return value;
  const node = dig(tree, m[1]);
  if (!node || node.$value === undefined) throw new Error(`unresolved alias {${m[1]}}`);
  return resolve(node.$value, tree, seen + 1);
}

export const flatten = (node, path = [], out = []) => {
  for (const [k, v] of Object.entries(node ?? {})) {
    if (k.startsWith('$')) continue;
    if (v && v.$value !== undefined) out.push([[...path, k].join('.'), v]);
    else if (v && typeof v === 'object') flatten(v, [...path, k], out);
  }
  return out;
};

/** Every pack on disk, newest schema and old single-brand schema alike. */
export function loadPacks() {
  if (!existsSync(BRANDS_DIR)) return [];
  return readdirSync(BRANDS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const pack = JSON.parse(readFileSync(join(BRANDS_DIR, file), 'utf8'));
      const brands = pack.brands ?? (pack.brand ? [pack.brand] : []);
      if (!brands.length) throw new Error(`${file}: needs "brands": [...] naming the [data-brand] values it serves`);
      if (!pack.semantic?.light || !pack.semantic?.dark) throw new Error(`${file}: a pack needs both semantic.light and semantic.dark`);
      return { file, brands, pack };
    });
}

/**
 * A pack's fully-resolved colours, per mode, as lowercase hex.
 *
 * Resolved rather than aliased on purpose: this is what the checksum hashes,
 * and Figma has no notion of our JSON paths. A resolved value is the one thing
 * both sides can compute identically, so `bg/canvas -> #ffffff` means the same
 * in a plugin sandbox as it does here. It also checks the thing that actually
 * matters, which is the colour that comes out rather than the route to it.
 */
export function resolvePack(pack) {
  const tree = { primitive: merge(base.primitive, pack.primitive) };
  const out = { primitive: {}, light: {}, dark: {} };
  for (const [name, node] of flatten(pack.primitive ?? {})) {
    out.primitive[name.replace(/^primitive\./, '')] = String(resolve(node.$value, tree)).toLowerCase();
  }
  for (const mode of ['light', 'dark']) {
    const merged = merge(base.semantic[mode], pack.semantic[mode]);
    for (const [name, node] of flatten(merged)) {
      if (node.$type !== 'color') continue;
      out[mode][name] = String(resolve(node.$value, tree)).toLowerCase();
    }
  }
  return out;
}

/**
 * The canonical string every checksum is taken over.
 *
 * Sorted, newline-joined, `section|key|value`. Names are lowercased and
 * slash-separated so a Figma variable called `Portfolio/Teal/600` and a JSON
 * path of `portfolio.teal.600` reduce to the same key — the export snippet
 * applies exactly this normalisation, and it is the reason the two sides can
 * agree at all.
 */
export const normaliseName = (n) => n.toLowerCase().replace(/\s+/g, '').replace(/\./g, '/');

export function canonical(resolved) {
  const lines = [];
  for (const [k, v] of Object.entries(resolved.primitive)) lines.push(`P|${normaliseName(k)}|${v}`);
  for (const mode of ['light', 'dark']) {
    for (const [k, v] of Object.entries(resolved[mode])) lines.push(`${mode[0].toUpperCase()}|${normaliseName(k)}|${v}`);
  }
  return lines.sort().join('\n');
}

export const checksum = (resolved) => hash(canonical(resolved));

/** Every pack, resolved and checksummed, keyed by file. */
export function packSummaries() {
  return loadPacks().map(({ file, brands, pack }) => {
    const resolved = resolvePack(pack);
    const str = canonical(resolved);
    return {
      file,
      brands,
      resolved,
      entries: str.split('\n').length,
      checksum: hash(str)
    };
  });
}
