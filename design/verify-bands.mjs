/**
 * Lints built pages against the band adjacency rules.
 *
 * The rules are not written here. They are read from design/banding-export.json,
 * which is measured off page.getSharedPluginData('banding','spec') in Figma.
 * An earlier version transcribed the rules into JavaScript, which meant they
 * existed in two places that never checked each other: changing a rule in Figma
 * would have left this passing on the old one.
 *
 * The property that makes it hold: every rule id in the spec must have a check
 * here, or be explicitly declared as covered elsewhere with a reason. Add a rule
 * in Figma and this fails until someone implements it. Silence is not an option
 * the script offers.
 *
 * Reads built HTML rather than source, so conditionally rendered bands count.
 *
 * Usage: node design/verify-bands.mjs   (run after `npm run build`)
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { hash } from './hash.mjs';

const DIST = 'dist';
const SPEC = 'design/banding-export.json';
const BAND = /data-band="([a-z-]+)"\s+data-scale="([a-z]+)"/g;

const spec = JSON.parse(readFileSync(SPEC, 'utf8'));

/** Deterministic serialisation. Metadata keys are excluded so re-exporting on a
 *  different day does not change the checksum. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).filter((k) => !k.startsWith('_')).sort()
      .map((k) => `${k}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** One implementation per rule id. Each returns a list of failures. */
const CHECKS = {
  1: (b) => b.flatMap((band, i) =>
    i > 0 && b[i - 1].role === band.role ? [`bands ${i} and ${i + 1} are both "${band.role}"`] : []),

  3: (b) => b.flatMap((band, i) => {
    if (band.role !== 'inverse-raised') return [];
    const touches = [b[i - 1], b[i + 1]].filter(Boolean);
    return touches.some((n) => n.role === 'inverse')
      ? [] : [`band ${i + 1} is inverse-raised but touches no inverse band`];
  }),

  4: (b) => {
    const n = b.filter((x) => x.role === 'inverse').length;
    const max = spec.roles.inverse.use.match(/max (\d+) per page/)?.[1];
    return n > Number(max ?? 2) ? [`${n} inverse bands, limit is ${max ?? 2}`] : [];
  },

  5: (b) => b.flatMap((band, i) => {
    const next = b[i + 1];
    return band.role === 'inverse' && next && next.role !== 'base'
      ? [`band ${i + 2} follows an inverse band with "${next.role}"`] : [];
  }),

  7: (b) => b.flatMap((band, i) =>
    i > 0 && b[i - 1].scale === 'feature' && band.scale === 'feature'
      ? [`bands ${i} and ${i + 1} are both "feature"`] : [])
};

/** Rules this script deliberately does not check, each with the reason. */
const COVERED_ELSEWHERE = {
  2: 'subsumed by rule 1: two inverse bands in a row are two consecutive bands sharing a fill',
  6: 'a CSS property, not a markup one. Covered by the no-literals assertion in design/verify.mjs'
};

// ---- the anti-drift check -------------------------------------------------
const specIds = spec.rules.map((r) => r.id);
const unimplemented = specIds.filter((id) => !(id in CHECKS) && !(id in COVERED_ELSEWHERE));
const orphaned = Object.keys(CHECKS).map(Number).filter((id) => !specIds.includes(id));

if (unimplemented.length || orphaned.length) {
  for (const id of unimplemented) {
    const r = spec.rules.find((x) => x.id === id);
    console.error(`rule ${id} is in the Figma spec but has no check here: "${r.rule}"`);
  }
  for (const id of orphaned) {
    console.error(`rule ${id} is checked here but no longer exists in the Figma spec`);
  }
  console.error('\nThe spec and the linter have drifted. Implement or remove the check.');
  process.exit(1);
}

if (!existsSync(DIST)) {
  console.error(`no ${DIST}/ directory. Run \`npm run build\` first.`);
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });
}

let failures = 0;
let pages = 0;

for (const file of htmlFiles(DIST).sort()) {
  const html = readFileSync(file, 'utf8');
  const bands = [...html.matchAll(BAND)].map(([, role, scale]) => ({ role, scale }));
  if (bands.length === 0) continue;
  pages += 1;

  const unknown = bands.filter((b) => !(b.role in spec.roles)).map((b) => b.role);
  const problems = [
    ...unknown.map((r) => `role "${r}" is not in the spec`),
    ...Object.entries(CHECKS).flatMap(([id, check]) =>
      check(bands).map((detail) => `rule ${id} (${spec.rules.find((r) => r.id === Number(id)).rule}): ${detail}`))
  ];

  const route = file.replace(`${DIST}/`, '/').replace(/index\.html$/, '');
  if (problems.length === 0) {
    console.log(`ok   ${route}  ${bands.map((b) => `${b.role}/${b.scale}`).join(' -> ')}`);
  } else {
    failures += problems.length;
    console.log(`FAIL ${route}`);
    for (const p of problems) console.log(`       ${p}`);
  }
}

console.log(`\nspec       : ${SPEC} (Figma page "${spec._page}")`);
console.log(`rules      : ${specIds.length} (${Object.keys(CHECKS).length} checked here, ${Object.keys(COVERED_ELSEWHERE).length} covered elsewhere)`);
console.log(`checksum   : ${hash(canonical(spec))}`);
console.log(`pages      : ${pages}`);

if (failures > 0) {
  console.error(`\nband adjacency failures: ${failures}`);
  process.exit(1);
}
console.log('band adjacency: all rules pass');
