#!/usr/bin/env node
/**
 * The local gate and the CI gate must be the same gate.
 *
 * They were not, and nothing said so. `npm run verify` ran six checks; CI ran
 * those plus a staleness check, a build, the band linter and the gap linter. So
 * a clean local run meant nothing about whether CI would pass, and the only way
 * to know was to push and wait — which is the exact friction the pre-commit
 * hook's own comment argues against, sitting one level up from it.
 *
 * `verify:all` is now the one definition and the workflow calls it, so the
 * common case is fixed by construction rather than by two lists agreeing. This
 * guards what is left: someone adding a step back into ci.yml directly, months
 * from now, and reintroducing the split without noticing.
 *
 * That failure has a track record here. `/how-this-was-built` claimed "N in
 * code, M with a published contract" from two counts derived differently, which
 * agreed at 20 and 20 by arithmetic coincidence — two errors cancelling. A
 * checksum in CLAUDE.md has gone stale three separate times for the same
 * reason. Wherever this repo has kept two things in step by hand, they have
 * drifted; the fix each time was to have a program ask the question.
 *
 *   node design/verify-gates.mjs
 */
import { readFileSync } from 'node:fs';
import { GATE, gateScripts } from './gate.mjs';

const root = new URL('../', import.meta.url).pathname;
const WORKFLOW = '.github/workflows/ci.yml';

/*
  Comment lines are stripped first. ci.yml explains itself heavily and several
  of those comments name the very commands they describe ("run npm run tokens
  && npm run specs"), which would otherwise be read as steps the workflow runs.
*/
const workflow = readFileSync(root + WORKFLOW, 'utf8')
  .split('\n')
  .filter((line) => !/^\s*#/.test(line))
  .join('\n');

const gate = gateScripts();
const ci = gateScripts(workflow);

const missingLocally = [...ci].filter((f) => !gate.has(f)).sort();
const missingInCi = [...gate].filter((f) => !ci.has(f)).sort();

if (missingLocally.length || missingInCi.length) {
  console.error('\ngates disagree — a clean local run would not predict CI:\n');
  if (missingLocally.length) {
    console.error(`  CI runs these, \`npm run ${GATE}\` does not:`);
    missingLocally.forEach((f) => console.error(`    ${f}`));
    console.error(`  Add them to the ${GATE} script.\n`);
  }
  if (missingInCi.length) {
    console.error(`  \`npm run ${GATE}\` runs these, ${WORKFLOW} does not:`);
    missingInCi.forEach((f) => console.error(`    ${f}`));
    console.error('  Something can land that CI never checked.\n');
  }
  process.exit(1);
}

/*
  "scripts", not "checks", and the distinction is the one gate.mjs draws: this
  compares every .mjs the gate reaches, generators included, because a
  generator dropping out of CI is drift too. The number of CHECKS is smaller
  and is `gateChecks()` — it is what the README states and what
  /how-this-was-built renders, so printing this total as "checks" would put two
  disagreeing numbers on one screen.
*/
console.log(`\ngates: ${WORKFLOW} and \`${GATE}\` run the same ${gate.size} scripts\n`);