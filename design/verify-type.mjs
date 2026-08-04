/**
 * Fails on type values that are not bound to the Figma text scale.
 *
 * Colour, spacing and radius have been checksummed against Figma since the
 * start; type was the one axis still written by hand, so component CSS carried
 * sizes and letter-spacing that appear on no scale and could drift from the
 * file without anything noticing.
 *
 * The rule: every font declaration resolves through `var(--type-*)`, which
 * tokens/css.mjs emits from tokens.json. Responsive type steps between two
 * styles on the scale at a breakpoint. It never clamps to a value in between,
 * because a clamp produces sizes that exist in no design file.
 *
 * Usage: node design/verify-type.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src';

/**
 * Every --type-* property tokens/css.mjs emits, derived from tokens.json rather
 * than from the generated CSS, so a reference is checked against the source of
 * truth and not against whatever happens to have been generated last.
 */
const SUFFIXES = ['', '-family', '-weight', '-size', '-line', '-tracking'];
function typeProperties() {
  const t = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
  const names = [];
  const walk = (node, path = []) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && v.$value !== undefined) names.push([...path, k].join('-'));
      else if (v && typeof v === 'object') walk(v, [...path, k]);
    }
  };
  walk(t.typography);
  return new Set(names.flatMap((n) => SUFFIXES.map((s) => `--type-${n}${s}`)));
}
const VALID = typeProperties();
const TYPE_REF = /var\(\s*(--type-[a-z0-9-]+)/g;

/** Generated, or a reset that deliberately inherits. */
const SKIP_FILES = ['src/styles/tokens.css', 'src/styles/base.css'];

const PROPS = ['font', 'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing'];
const DECL = new RegExp(`(?<![-\\w])(${PROPS.join('|')})\\s*:\\s*([^;{}"']+)`, 'g');

/** Values that carry no scale information and so cannot drift. */
const ALLOWED = /^(inherit|initial|unset|normal|0|none|revert)$/;

/**
 * Escape hatch. Put `type-lint-allow` in a comment on the line or the line
 * above, with the reason. It exists for values that must stay relative to their
 * container, which is a real case and a rare one. It is not for "I did not want
 * to find the token".
 */
const ALLOW_MARKER = 'type-lint-allow';

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

  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    // Comments do not ship.
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;

    const allowed = line.includes(ALLOW_MARKER) || (lines[i - 1] ?? '').includes(ALLOW_MARKER);

    // A reference that resolves to nothing is worse than a literal: it renders
    // as an inherited default and looks deliberate.
    for (const [, ref] of line.matchAll(TYPE_REF)) {
      if (!VALID.has(ref)) {
        problems.push({ file: rel, line: i + 1, prop: 'unknown token', value: `var(${ref})` });
      }
    }

    for (const [, prop, rawValue] of line.matchAll(DECL)) {
      const value = rawValue.trim();
      if (value.includes('var(--type-')) continue;
      if (ALLOWED.test(value)) continue;
      if (allowed) continue;
      problems.push({ file: rel, line: i + 1, prop, value });
    }
  });
}

if (problems.length === 0) {
  console.log(`files checked  : ${checked}`);
  console.log(`type properties: ${VALID.size} from tokens.json`);
  console.log('type           : every font value binds to a --type-* that exists');
  process.exit(0);
}

console.log(`files checked: ${checked}\n`);
for (const p of problems) {
  console.log(`  ${p.file}:${p.line}  ${p.prop}: ${p.value}`);
}
console.error(`\nunbound type values: ${problems.length}`);
console.error('Bind these to a var(--type-*) property, or step between two scale styles at a breakpoint.');
process.exit(1);
