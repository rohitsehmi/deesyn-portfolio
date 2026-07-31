/**
 * Verifies tokens/figma-export.json against the live Figma file.
 *
 *   node tokens/verify.mjs
 *
 * Prints a checksum. Run the matching snippet (printed below) via the Figma
 * Console MCP `figma_execute` and compare — identical checksums mean the
 * export is a faithful copy of the Figma variables.
 *
 * Also checks internal integrity: every semantic alias must resolve to a
 * primitive that actually exists.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(readFileSync(join(here, 'figma-export.json'), 'utf8'));

export function canonical({ P, S, T, E, G }) {
  const parts = [];
  for (const k of Object.keys(P).sort()) parts.push(`P|${k}|${P[k]}`);
  for (const k of Object.keys(S).sort()) parts.push(`S|${k}|${S[k].join(',')}`);
  for (const k of Object.keys(T).sort()) parts.push(`T|${k}|${T[k].join(',')}`);
  for (const k of Object.keys(E).sort()) parts.push(`E|${k}|${E[k].map((l) => l.join(',')).join(';')}`);
  for (const k of Object.keys(G).sort()) parts.push(`G|${k}|${G[k].map((s) => s.join(',')).join(';')}`);
  return parts.join('\n');
}

export function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h;
}

// --- integrity: do all semantic aliases point at real primitives? ---
const broken = [];
for (const [key, modes] of Object.entries(src.S)) {
  for (const ref of modes) if (!(ref in src.P)) broken.push(`${key} -> ${ref}`);
}

const str = canonical(src);
console.log('entries :', str.split('\n').length);
console.log('length  :', str.length);
console.log('checksum:', hash(str));
console.log(
  broken.length ? `BROKEN ALIASES (${broken.length}):\n  ${broken.join('\n  ')}` : 'aliases : all resolve OK'
);
