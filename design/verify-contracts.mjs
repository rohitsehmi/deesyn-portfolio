/**
 * Every component in src/components has a published contract somewhere.
 *
 *   node design/verify-contracts.mjs
 *
 * Why this exists
 * ---------------
 * /how-this-was-built renders "N in code, M with a published contract". That
 * sentence is the site's own claim about itself, on the page that argues the
 * whole approach, and until 2026-08-10 the two numbers were counted from
 * different things: components from `src/components/*.tsx`, contracts from the
 * number of files in the spec directories.
 *
 * They agreed at 20 and 20, which read as complete coverage. It was arithmetic
 * luck. `Link.tsx` exports both Link and ArrowLink and produces two specs;
 * `Band.tsx` produces none in those directories because its contract lives in
 * design/banding-export.json alongside the adjacency rules. Two errors that
 * cancelled. Add one component with no spec and the counts would still have
 * looked plausible while the claim quietly became false.
 *
 * So the claim is now computed by asking the real question per component, and
 * this check fails the build if any component cannot answer it. A page that
 * measures itself needs something that stops the measurement drifting from what
 * it measures, which is the same argument as every other check in here.
 */
import { readdirSync, existsSync } from 'node:fs';
import { COMPONENTS_DIR, FIGMA_SPEC_DIRS } from './paths.mjs';

/*
  The one check that genuinely changes shape under a second brand. Components
  are shared and Figma contracts are not, so "21 components, 21 contracts"
  becomes "for each pack, every component resolves to a contract in that pack" —
  one component set against N sets of contracts. Left as-is until there is a
  second pack to iterate over, since a loop over one element is just this.
*/
const SPEC_DIRS = FIGMA_SPEC_DIRS;

/**
 * Components whose contract is published somewhere other than a spec directory.
 * Each entry is a deliberate decision, not an exemption: the file named has to
 * exist, and is checked below.
 */
const CONTRACT_ELSEWHERE = {
  band: 'design/banding-export.json'
};

const specSlugs = new Set(
  SPEC_DIRS.flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)))
);

const componentFiles = readdirSync(COMPONENTS_DIR).filter(
  (f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx')
);

/* Spec slugs are `<domain>-<name>`, and the match has to be on the whole name.
   A suffix test looked tidy and was wrong: `Button` matched `action-icon-button`
   as well as `action-button`, so IconButton was covering for Button and a
   missing Button spec would not have been noticed. */
const DOMAINS = ['action', 'content', 'layout', 'chrome', 'brand'];
const slugFor = (file) => file.slice(0, -4).replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();

const rows = [];
const missing = [];
for (const file of componentFiles) {
  const slug = slugFor(file);
  const elsewhere = CONTRACT_ELSEWHERE[slug];
  if (elsewhere) {
    if (!existsSync(elsewhere)) {
      missing.push(`${file} — declared as contracted by ${elsewhere}, which does not exist`);
      continue;
    }
    rows.push([file, elsewhere]);
    continue;
  }
  const hits = [...specSlugs].filter((s) => s === slug || DOMAINS.some((d) => s === `${d}-${slug}`));
  if (!hits.length) {
    missing.push(`${file} — no spec matching "${slug}" in ${SPEC_DIRS.join(', ')}`);
    continue;
  }
  rows.push([file, hits.join(', ')]);
}

for (const [file, where] of rows) console.log(`  ${file.padEnd(24)} ${where}`);
console.log(`\ncomponents : ${componentFiles.length}`);
console.log(`contracted : ${rows.length}`);
console.log(`spec files : ${specSlugs.size}  (more than one component may publish several)`);

if (missing.length) {
  console.error(`\nFAIL — ${missing.length} component(s) with no published contract:`);
  for (const m of missing) console.error(`  ${m}`);
  console.error(
    '\nEither add a spec (npm run specs), or, if the contract genuinely belongs\n' +
      'elsewhere, record that in CONTRACT_ELSEWHERE here with the file that holds it.'
  );
  process.exit(1);
}
console.log('contracts  : every component has one');