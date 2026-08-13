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
import { SRC_DIR, TOKENS } from './paths.mjs';

/*
  This check does more than its name suggests once there is more than one brand.
  "Every var(--*) in src/ resolves against tokens.json" is a typo-catcher today;
  pointed at a second pack it becomes a completeness test — proof that the pack
  defines every token the shared framework renders. That is the guarantee worth
  having before pointing a new brand at these components, and it already exists.
*/
const ROOT = SRC_DIR;

/** Generated. Everything else in src/ is checked, including base.css. */
const SKIP_FILES = ['src/styles/tokens.css'];

const PROPS = ['font', 'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing'];

/**
 * Matches a font declaration in CSS (`font: var(--type-body-l);`) and in a JSX
 * style object (`font: 'var(--type-display-m)',`). The quoted form has to be
 * handled explicitly: reading to the first quote captures an empty value and
 * reports a bound declaration as unbound.
 */
const DECL = new RegExp(
  `(?<![-\\w])(${PROPS.join('|')})\\s*:\\s*(?:'([^']*)'|"([^"]*)"|([^;{}]+))`, 'g'
);
const declValue = (m) => (m[2] ?? m[3] ?? m[4] ?? '').trim();
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
  return out;
}

/** The namespaces tokens.json owns. Nothing in src/ may declare into them. */
const TOKEN_NAMESPACES = ['--primitive-', '--semantic-', '--type-', '--shadow-', '--gradient-'];
/** Matches `--x:` in CSS and `'--x':` in a JSX style object. */
const DECLARATION = /(--[a-z0-9-]+)['"]?\s*:/g;

const TOKENS_SET = validProperties();

function files(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(css|astro|tsx)$/.test(path) ? [path] : [];
  });
}

const sources = files(ROOT).sort().map((f) => [relative('.', f), readFileSync(f, 'utf8')]);

/**
 * Custom properties a component declares for itself: `--parallax-drift`,
 * `--z-sticky`. They parameterise a component or name a stacking layer, and
 * neither has a Figma equivalent, so they cannot come from tokens.json.
 *
 * Collected from where they are declared rather than allowed by prefix, so a
 * reference to something never declared anywhere still fails. Declarations
 * inside a token namespace are rejected below: redefining `--semantic-*`
 * locally is the exact drift this file exists to prevent.
 */
const locals = new Set();
for (const [rel, text] of sources) {
  if (rel === 'src/styles/tokens.css') continue;
  for (const [, name] of text.matchAll(DECLARATION)) {
    if (!TOKEN_NAMESPACES.some((ns) => name.startsWith(ns))) locals.add(name);
  }
}
const VALID = new Set([...TOKENS_SET, ...locals]);

const problems = [];
let checked = 0;

for (const [rel, text] of sources) {
  if (SKIP_FILES.includes(rel)) continue;
  checked += 1;

  const lines = text.split('\n');

  lines.forEach((line, i) => {
    // Comments do not ship. They also legitimately name other people's tokens,
    // such as Revolut's own --rui-color-foreground.
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;

    const at = { file: rel, line: i + 1 };

    for (const [, ref] of line.matchAll(VAR_REF)) {
      if (!VALID.has(ref)) problems.push({ ...at, kind: 'unknown property', detail: `var(${ref})` });
    }

    // tokens.json owns these namespaces. Redeclaring one locally is drift.
    for (const [, name] of line.matchAll(DECLARATION)) {
      if (TOKEN_NAMESPACES.some((ns) => name.startsWith(ns))) {
        problems.push({ ...at, kind: 'redeclares a token', detail: `${name} is owned by tokens.json` });
      }
    }

    const allowed = line.includes(ALLOW_MARKER) || (lines[i - 1] ?? '').includes(ALLOW_MARKER);
    for (const m of line.matchAll(DECL)) {
      const prop = m[1];
      const value = declValue(m);
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
