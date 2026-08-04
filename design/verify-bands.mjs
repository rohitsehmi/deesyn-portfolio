/**
 * Lints built pages against the band adjacency rules in docs/banding-system.md §3.
 *
 * The doc says a page built from bands can be linted rather than checked by eye.
 * This is that lint. It exists because the rules were broken twice in one
 * sitting: the placeholder index page stacked a base nav above a base hero, and
 * the first case-study layout ran three `feature` bands in a row.
 *
 * Reads the built HTML rather than the source, so it checks what actually
 * ships, including bands rendered conditionally.
 *
 * Rule 6 (no borders or shadows on a seam) is not checked here: it is a CSS
 * property, covered by the no-literals assertion in design/verify.mjs.
 *
 * Usage: node design/verify-bands.mjs   (run after `npm run build`)
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const BAND = /data-band="([a-z-]+)"\s+data-scale="([a-z]+)"/g;

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });
}

/** Every rule takes the ordered band list and returns a list of failures. */
const rules = [
  {
    id: 1,
    text: 'No two consecutive bands share a fill',
    check: (b) => b.flatMap((band, i) =>
      i > 0 && b[i - 1].role === band.role
        ? [`bands ${i} and ${i + 1} are both "${band.role}"`]
        : [])
  },
  {
    id: 3,
    text: 'inverse-raised may only touch inverse',
    check: (b) => b.flatMap((band, i) => {
      if (band.role !== 'inverse-raised') return [];
      const touches = [b[i - 1], b[i + 1]].filter(Boolean);
      return touches.some((n) => n.role === 'inverse')
        ? []
        : [`band ${i + 1} is inverse-raised but touches no inverse band`];
    })
  },
  {
    id: 4,
    text: 'At most two inverse bands per page',
    check: (b) => {
      const n = b.filter((x) => x.role === 'inverse').length;
      return n > 2 ? [`${n} inverse bands`] : [];
    }
  },
  {
    id: 5,
    text: 'After an inverse band, return to base',
    check: (b) => b.flatMap((band, i) => {
      const next = b[i + 1];
      return band.role === 'inverse' && next && next.role !== 'base'
        ? [`band ${i + 2} follows an inverse band with "${next.role}"`]
        : [];
    })
  },
  {
    id: 7,
    text: 'Two adjacent bands never both take feature',
    check: (b) => b.flatMap((band, i) =>
      i > 0 && b[i - 1].scale === 'feature' && band.scale === 'feature'
        ? [`bands ${i} and ${i + 1} are both "feature"`]
        : [])
  }
];

if (!existsSync(DIST)) {
  console.error(`no ${DIST}/ directory. Run \`npm run build\` first.`);
  process.exit(1);
}

let failures = 0;
let pages = 0;

for (const file of htmlFiles(DIST).sort()) {
  const html = readFileSync(file, 'utf8');
  const bands = [...html.matchAll(BAND)].map(([, role, scale]) => ({ role, scale }));
  if (bands.length === 0) continue;
  pages += 1;

  const problems = rules.flatMap((rule) =>
    rule.check(bands).map((detail) => `rule ${rule.id} (${rule.text}): ${detail}`)
  );

  const route = file.replace(`${DIST}/`, '/').replace(/index\.html$/, '');
  if (problems.length === 0) {
    console.log(`ok   ${route}  ${bands.map((b) => `${b.role}/${b.scale}`).join(' -> ')}`);
  } else {
    failures += problems.length;
    console.log(`FAIL ${route}`);
    for (const p of problems) console.log(`       ${p}`);
  }
}

console.log(`\npages checked: ${pages}`);
if (failures > 0) {
  console.error(`band adjacency failures: ${failures}`);
  process.exit(1);
}
console.log('band adjacency: all rules pass');
