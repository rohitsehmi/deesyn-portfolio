#!/usr/bin/env node
/**
 * Brand packs: integrity, and a checksum Figma can reproduce.
 *
 *   node tokens/verify-brands.mjs        (or: npm run verify:brands)
 *
 * The same job tokens/verify.mjs does for the base collection, for the packs
 * that extend it. It resolves every pack, asserts the things a pack can get
 * wrong, and prints a checksum that tokens/brand-export.snippet.js reproduces
 * from inside the brand's own Figma file — so the file and the repo cannot
 * drift apart silently, which is the single claim this whole design system
 * rests on.
 *
 * WHAT IT ASSERTS, and why each one is here rather than left to review:
 *
 *   - Every alias resolves. A pack aliasing a primitive it forgot to define
 *     renders as an inherited default, which looks deliberate. Same class of
 *     failure as the mistyped custom property verify-css.mjs exists for.
 *   - The semantic layer is ALL aliases, never literals. This is the base
 *     collection's zero-literals rule applied one level out: a hex typed into
 *     a pack's semantic layer is a value that no longer re-themes, and the
 *     entire point of the split is that re-theming is a one-file change.
 *   - Both modes are present and cover the same tokens. A pack that repoints
 *     fg/primary in light and forgets dark is not half-themed, it is broken in
 *     exactly one mode — and dark is the one nobody screenshots.
 *   - No two packs claim the same brand, which would make the emitted CSS
 *     depend on filename order.
 *
 * Brands declared by a pack but absent from src/data/brands.ts are PRINTED,
 * not failed. That is how a palette is kept without a hostname serving it, and
 * printing it follows verify.mjs with deprecated components and
 * verify-provenance.mjs with reconstructions: a thing that is deliberately
 * inert has to stay visible or it becomes a surprise to whoever finds it next.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPacks, resolvePack, canonical, flatten, BRANDS_DIR } from './brands.mjs';
import { hash } from '../design/hash.mjs';
import { BRANDS } from '../src/data/brands.ts';

const problems = [];
const inert = [];
const claimed = new Map();

const packs = loadPacks();
if (!packs.length) {
  console.log('\nbrand packs: none in tokens/brands/ — the base collection is the only brand\n');
  process.exit(0);
}

const rows = [];

for (const { file, brands, pack } of packs) {
  for (const b of brands) {
    if (claimed.has(b)) problems.push(`${file}: brand "${b}" is already claimed by ${claimed.get(b)}`);
    else claimed.set(b, file);
    if (!BRANDS.includes(b)) inert.push(`${b} (declared in ${file}, not in src/data/brands.ts)`);
  }

  /* Semantic values must be aliases. A literal here is a value that has opted
     out of ever being re-themed, which is the one thing a pack exists to do. */
  for (const mode of ['light', 'dark']) {
    for (const [name, node] of flatten(pack.semantic[mode] ?? {})) {
      const v = node.$value;
      if (typeof v !== 'string' || !/^\{.+\}$/.test(v)) {
        problems.push(`${file}: semantic.${mode}.${name} is a literal (${v}) — alias a primitive instead`);
      }
    }
  }

  /* Both modes must cover the same tokens. */
  const keys = (m) => new Set(flatten(pack.semantic[m] ?? {}).map(([n]) => n));
  const [L, D] = [keys('light'), keys('dark')];
  for (const k of L) if (!D.has(k)) problems.push(`${file}: semantic.light.${k} has no dark counterpart`);
  for (const k of D) if (!L.has(k)) problems.push(`${file}: semantic.dark.${k} has no light counterpart`);

  let resolved;
  try {
    resolved = resolvePack(pack);
  } catch (err) {
    problems.push(`${file}: ${err.message}`);
    continue;
  }

  const str = canonical(resolved);
  rows.push({
    file,
    brands: brands.join(', '),
    live: brands.filter((b) => BRANDS.includes(b)).length,
    primitives: Object.keys(resolved.primitive).length,
    entries: str.split('\n').length,
    checksum: hash(str)
  });
}

if (problems.length) {
  console.error(`\nbrand packs — ${problems.length} problem${problems.length > 1 ? 's' : ''}:`);
  problems.forEach((p) => console.error(`  ${p}`));
  console.error('');
  process.exit(1);
}

console.log('');
for (const r of rows) {
  console.log(`brand pack : ${r.file}  ->  ${r.brands}`);
  console.log(`  primitives : ${r.primitives}`);
  console.log(`  entries    : ${r.entries}  (primitives + both modes, fully resolved)`);
  console.log(`  checksum   : ${r.checksum}`);
}
if (inert.length) {
  console.log(`\n  declared but not live — kept deliberately, nothing emits for them:`);
  inert.forEach((b) => console.log(`    ${b}`));
}
console.log(`\nbrand packs: ${rows.length} pack(s) valid, every semantic value an alias, both modes complete\n`);
