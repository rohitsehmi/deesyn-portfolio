/**
 * Verifies the component contracts.
 *
 *   node components/verify.mjs
 *
 * Three checks, in order of how badly you want them to pass:
 *
 * 1. INTEGRITY — every token name referenced by a component resolves in
 *    tokens/tokens.json. This is the one that matters: it is what stops the
 *    design system and the code drifting apart silently. A component pointing
 *    at a token that no longer exists is a broken contract, not a warning.
 *
 * 2. NO LITERALS — no component may reference a raw hex, px value or duration.
 *    Everything is a token name.
 *
 * 3. CHECKSUM — a canonical hash of the whole contract. Run the snippet in
 *    components/figma-export.snippet.js inside Figma and compare. Identical
 *    checksums mean the repo is a faithful mirror of the file.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveToken, resolveTextStyle, tokenKey } from './build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(readFileSync(join(here, 'figma-export.json'), 'utf8'));

// ---- 1. integrity: every referenced token exists -------------------------
const broken = [];
const used = new Set();
for (const [cname, c] of Object.entries(src.components)) {
  for (const [vn, v] of Object.entries(c.variants)) {
    for (const [node, binds] of Object.entries(src.tokenSets[v.t])) {
      for (const [prop, name] of Object.entries(binds)) {
        if (prop === 'textDecoration') continue;
        used.add(name);
        const ok = prop === 'textStyle' ? resolveTextStyle(name) : resolveToken(name);
        if (!ok) broken.push(`${cname} / ${vn} / ${node} / ${prop} -> ${name}`);
      }
    }
  }
}

// ---- 2. no literals ------------------------------------------------------
const LITERAL = /^(#|\d|rgba?\(|\d+px|\d+ms)/i;
const literals = [...used].filter((n) => LITERAL.test(n));

// ---- 3. checksum ---------------------------------------------------------
export function canonical(s) {
  const parts = [];
  for (const name of Object.keys(s.components).sort()) {
    const c = s.components[name];
    for (const k of Object.keys(c.props).sort()) {
      const d = c.props[k];
      parts.push(`P|${name}|${k}|${d.type}|${(d.values || []).join(',')}`);
    }
    for (const vn of Object.keys(c.variants).sort()) {
      const v = c.variants[vn];
      const set = s.tokenSets[v.t];
      const flat = Object.keys(set).sort().map((node) =>
        `${node}{${Object.keys(set[node]).sort().map((p) => `${p}=${set[node][p]}`).join(',')}}`).join(';');
      parts.push(`V|${name}|${vn}|${v.size.join('x')}|${flat}`);
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
const components = Object.keys(src.components).length;
const variants = Object.values(src.components).reduce((a, c) => a + Object.keys(c.variants).length, 0);

console.log('components :', components);
console.log('variants   :', variants);
console.log('tokenSets  :', src.tokenSets.length);
console.log('tokens used:', used.size);
console.log('entries    :', str.split('\n').length);
console.log('length     :', str.length);
console.log('checksum   :', hash(str));
console.log(broken.length ? `BROKEN TOKEN REFS (${broken.length}):\n  ${broken.join('\n  ')}` : 'tokens     : all resolve OK');
console.log(literals.length ? `LITERALS FOUND (${literals.length}): ${literals.join(', ')}` : 'literals   : none — every value is a token');

if (broken.length || literals.length) process.exit(1);
