#!/usr/bin/env node
/**
 * The README states numbers it cannot compute. This checks them.
 *
 * /how-this-was-built resolves every figure at build time from the files it
 * describes, so it cannot go stale — that is the whole argument of the page.
 * README.md is markdown read on GitHub with no build step to substitute into,
 * so it has to type its numbers, and typed numbers here have a record:
 *
 *   - "Eight checks run on every push" survived Gaps being added (nine), then
 *     Provenance and Gates (eleven). Wrong twice, in a file nobody re-reads.
 *   - "two case studies" survived a third going live.
 *
 * Both read as perfectly ordinary sentences, which is exactly why neither was
 * caught by anyone looking at the page. So the numbers stay typed and a program
 * checks them, which is the same move as the page counting the gate rather than
 * the workflow — one level further out.
 *
 * IT COUNTS THE LIST AS WELL AS THE TOTAL. A correct total above a short list is
 * the precise shape of the bug the page already had, where `{checks}` was
 * measured and the list beneath it was written by hand.
 *
 * All counting comes from design/counts.mjs, which the page imports too, so a
 * disagreement between them is impossible rather than merely unlikely.
 *
 *   node design/verify-readme.mjs
 */
import { readFileSync } from 'node:fs';
import { tokenCount, componentCount, storyCount, checkCount, brandCount } from './counts.mjs';

const readme = readFileSync('README.md', 'utf8');

const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const word = (n) => WORDS[n] ?? String(n);

const problems = [];

/**
 * Each claim names what it is, what the README should say, and a pattern that
 * finds the number in the prose. A pattern that stops matching is itself a
 * failure: it means the sentence was rewritten and nobody re-checked the figure.
 */
const CLAIMS = [
  /*
    THE BRAND COUNT, added 2026-08-26 with the fourth and fifth brands.

    It was prose nothing looked at, in a file whose numbers have gone stale
    twice already, and it names the thing most likely to change: this repo has
    added a brand three times now and every one of them left a count behind
    somewhere. CLAUDE.md has been checked on the same figure since 2026-08-19,
    and both read it from design/counts.mjs rather than parsing brands.ts
    twice — the second consumer of a count is exactly when a second
    implementation of it appears, which is what counts.mjs exists to prevent.
  */
  {
    what: 'brands',
    expected: brandCount(),
    re: /\*\*One build serves (\w+) brands, chosen by hostname\.\*\*/,
    parse: (m) => WORDS.indexOf(m[1].toLowerCase())
  },
  {
    what: 'leaf tokens',
    expected: tokenCount(),
    re: /comprising (\d[\d,]*) tokens exported from Figma/,
    parse: (m) => Number(m[1].replace(/,/g, ''))
  },
  {
    what: 'components',
    expected: componentCount(),
    re: /tokens exported from Figma, (\d+) components/,
    parse: (m) => Number(m[1])
  },
  {
    what: 'stories',
    expected: storyCount(),
    re: /snapshots all (\d+) stories/,
    parse: (m) => Number(m[1])
  },
  {
    what: 'checks (stated)',
    expected: checkCount(),
    re: /^(\w+) checks run on every push/mi,
    parse: (m) => WORDS.indexOf(m[1].toLowerCase())
  }
];

for (const c of CLAIMS) {
  const m = readme.match(c.re);
  if (!m) {
    problems.push(`${c.what}: the sentence stating it has changed shape — re-check the figure, then fix the pattern in this file`);
    continue;
  }
  const found = c.parse(m);
  if (found !== c.expected) {
    problems.push(`${c.what}: README says ${found === -1 ? `"${m[1]}"` : found}, actual is ${c.expected} (${word(c.expected)})`);
  }
}

/* The bulleted list under "What is checked" must be as long as the total above
   it. See the header: a right total over a short list is the failure mode. */
const bullets = (readme.match(/^- \*\*/gm) ?? []).length;
if (bullets !== checkCount()) {
  problems.push(`checks (listed): README lists ${bullets} bullets, the gate runs ${checkCount()}`);
}

if (problems.length) {
  console.error(`\nREADME.md is out of date — ${problems.length} claim${problems.length > 1 ? 's' : ''}:`);
  problems.forEach((p) => console.error(`  ${p}`));
  console.error('');
  process.exit(1);
}

console.log(`\nREADME: ${CLAIMS.length} stated numbers agree with the repo`);
console.log(`  ${CLAIMS.map((c) => `${c.what} ${c.expected}`).join('  ·  ')}`);
console.log(`  checks listed ${bullets}\n`);