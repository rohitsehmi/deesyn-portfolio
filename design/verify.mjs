/**
 * Verifies the design-system contracts across all three domains.
 *
 *   node design/verify.mjs
 *
 * Three checks, in order of how badly you want them to pass:
 *
 * 1. INTEGRITY — every token a component references resolves in
 *    tokens/tokens.json. This is the one that matters: it is what stops the
 *    design system and the code drifting apart silently. Exits non-zero.
 *
 * 2. NO LITERALS — no contract may carry a raw hex, px or ms value.
 *
 * 3. CHECKSUM — a canonical hash of every contract. Run the snippet in
 *    design/figma-export.snippet.js inside Figma and compare.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveToken, resolveTextStyle } from './build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(readFileSync(join(here, 'figma-export.json'), 'utf8'));

const all = [];
for (const [domain, d] of Object.entries(src.domains))
  for (const [name, c] of Object.entries(d.components)) all.push({ domain, name, c });

const broken = [], used = new Set();
for (const { domain, name, c } of all)
  for (const [vn, v] of Object.entries(c.variants))
    for (const [node, binds] of Object.entries(src.tokenSets[v.t]))
      for (const [prop, tok] of Object.entries(binds)) {
        if (prop === 'textDecoration') continue;
        used.add(tok);
        const ok = prop === 'textStyle' ? resolveTextStyle(tok) : resolveToken(tok);
        if (!ok) broken.push(`${domain}/${name} / ${vn} / ${node} / ${prop} -> ${tok}`);
      }

const LITERAL = /^(#|\d|rgba?\(|\d+px|\d+ms)/i;
const literals = [...used].filter((n) => LITERAL.test(n));

export function canonical(s) {
  const parts = [];
  const flat = [];
  for (const [domain, d] of Object.entries(s.domains))
    for (const name of Object.keys(d.components)) flat.push([domain, name, d.components[name]]);
  flat.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
  for (const [domain, name, c] of flat) {
    for (const k of Object.keys(c.props).sort()) {
      const p = c.props[k];
      parts.push(`P|${domain}|${name}|${k}|${p.type}|${(p.values || []).join(',')}`);
    }
    for (const vn of Object.keys(c.variants).sort()) {
      const v = c.variants[vn], set = s.tokenSets[v.t];
      const f = Object.keys(set).sort().map((n) =>
        `${n}{${Object.keys(set[n]).sort().map((p) => `${p}=${set[n][p]}`).join(',')}}`).join(';');
      parts.push(`V|${domain}|${name}|${vn}|${v.size.join('x')}|${f}`);
    }
  }
  return parts.join('\n');
}
export function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h;
}

const str = canonical(src);
for (const [domain, d] of Object.entries(src.domains)) {
  const n = Object.values(d.components).reduce((a, c) => a + Object.keys(c.variants).length, 0);
  console.log(`${domain.padEnd(11)}: ${Object.keys(d.components).length} components, ${n} variants  (Figma page "${d.page}")`);
}
console.log('tokenSets  :', src.tokenSets.length);
console.log('tokens used:', used.size);
console.log('entries    :', str.split('\n').length);
console.log('length     :', str.length);
console.log('checksum   :', hash(str));
console.log(broken.length ? `BROKEN TOKEN REFS (${broken.length}):\n  ${broken.join('\n  ')}` : 'tokens     : all resolve OK');
console.log(literals.length ? `LITERALS (${literals.length}): ${literals.join(', ')}` : 'literals   : none — every value is a token');

if (broken.length || literals.length) process.exit(1);
