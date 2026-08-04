/**
 * Cross-checks the CSS in src/ against tokens/tokens.json.
 *
 * Two assertions, both about the code side of the system. design/verify.mjs
 * covers what was measured off Figma; this covers what was written by hand.
 *
 *   1. Every custom property referenced resolves to a real token. A typo like
 *      --semantic-fg-secondry is not a build error in CSS: it renders as an
 *      inherited default and looks deliberate. Nothing else catches it.
 *
 *   2. Every font declaration binds to var(--type-*). Colour, spacing and
 *      radius were checksummed against Figma from the start; type was written
 *      by hand until 2026-08-04. Responsive type steps between two styles on
 *      the scale at a breakpoint. It never clamps to a value in between,
 *      because a clamp renders sizes that exist in no design file.
 *
 * Supersedes design/verify-type.mjs, which only checked assertion 2.
 *
 * Usage: node design/verify-css.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src';
const TOKENS = 'tokens/tokens.json';

/** Generated, or a reset that deliberately inherits. */
const SKIP_FILES = ['src/styles/tokens.css', 'src/styles/base.css'];

const PROPS = ['font', 'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing'];
const DECL = new RegExp(`(?<![-\\w])(${PROPS.join('|')})\\s*:\\s*([^;{}"']+)`, 'g');
const VAR_REF = /var\(\s*(--[a-z0-9-]+)/g;

/** Values that carry no scale information and so cannot drift. */
const ALLOWED = /^(inherit|initial|unset|normal|0|none|revert)$/;

/**
 * Escape hatch. Put `type-lint-allow` in a comment on the line or the line
 * above, with the reason. It exists for values that must stay relative to their
 * container, which is a real case and a rare one. It is not for "I did not want
 * to find the token".
 */
const ALLOW_MARKER = 'type-lint-allow';

/** Type styles expand to longhands; everything else is one property each. */
const TYPE_SUFFIXES = ['', '-family', '-weight', '-size', '-line', '-tracking'];

function validProperties() {
  const t = JSON.parse(readFileSync(TOKENS, 'utf8'));
  const out = new Set();
  const walk = (node, path, sink) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && v.$value !== undefined) sink([...path, k].join('-'));
      else if (v && typeof v === 'object') walk(v, [...path, k], sink);
    }
  };
  const add = (n) => out.add(`--${n}`);
  walk(t.primitive, ['primitive'], add);
  walk(t.semantic.light, ['semantic'], add);
  walk(t.shadow, ['shadow'], add);
  walk(t.gradient, ['gradient'], add);
  walk(t.typography, ['type'], (n) => TYPE_SUFFIXES.forEach((s) => out.add(`--${n}${s}`)));

  /**
   * Stacking order is a code concern: Figma has no z-index, so these cannot
   * come from tokens.json. They are read from where they are declared rather
   * than allowed by prefix, so `var(--z-stikcy)` still fails.
   */
  const base = readFileSync('src/styles/base.css', 'utf8');
  for (const [, name] of base.matchAll(/(--z-[a-z0-9-]+)\s*:/g)) out.add(name);

  return out;
}
const VALID = validProperties();

function files(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(css|astro|tsx)$/.test(path) ? [path] : [];
  });
}

const problems = [];
let checked = 0;

for (const file of files(ROOT).sort()) {
  const rel = relative('.', file);
  if (SKIP_FILES.includes(rel)) continue;
  checked += 1;

  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    // Comments do not ship. They also legitimately name other people's tokens,
    // such as Revolut's own --rui-color-foreground.
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;

    const at = { file: rel, line: i + 1 };

    for (const [, ref] of line.matchAll(VAR_REF)) {
      if (!VALID.has(ref)) problems.push({ ...at, kind: 'unknown token', detail: `var(${ref})` });
    }

    const allowed = line.includes(ALLOW_MARKER) || (lines[i - 1] ?? '').includes(ALLOW_MARKER);
    for (const [, prop, rawValue] of line.matchAll(DECL)) {
      const value = rawValue.trim();
      if (value.includes('var(--type-') || ALLOWED.test(value) || allowed) continue;
      problems.push({ ...at, kind: `unbound ${prop}`, detail: value });
    }
  });
}

if (problems.length === 0) {
  console.log(`files checked : ${checked}`);
  console.log(`properties    : ${VALID.size} from ${TOKENS}`);
  console.log('css           : every token reference resolves, every font value bound');
  process.exit(0);
}

console.log(`files checked : ${checked}\n`);
for (const p of problems) console.log(`  ${p.file}:${p.line}  ${p.kind}: ${p.detail}`);
console.error(`\ncss failures: ${problems.length}`);
process.exit(1);
