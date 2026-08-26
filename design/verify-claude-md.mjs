#!/usr/bin/env node
/**
 * CLAUDE.md states numbers it cannot compute. This checks them.
 *
 * That file is the working technical record and it is mostly prose, so most of
 * it is unverifiable by construction and this makes no attempt on it. What it
 * covers is the narrow part that is a fact about the repository stated in
 * words, because that part has a long record of going quietly wrong:
 *
 *   - THREE STALE CHECKSUMS have sat in it, `1567749477`, `2975374804` and
 *     `2397650938`, each recorded as current while the build printed something
 *     else. The file argues with itself about this in § Contracts, telling the
 *     reader to "re-read a checksum from verify.mjs rather than trusting this
 *     file", which is an instruction that only exists because the copy in the
 *     file could not be trusted. Now a program does the re-reading.
 *
 *   - SIX CLAIMS IN § NEXT UP were stale at once on 2026-08-19: the brand count
 *     twice, the host redirect, the README, the Storybook brand toolbar and the
 *     number of hostnames the lockup question is asked on. Three of the six were
 *     the same count failing to move when the third brand shipped. In every case
 *     the body of the file was already right and only the list was wrong, so the
 *     file disagreed with itself rather than with the repo, and all six read as
 *     ordinary sentences.
 *
 * The same argument as design/verify-readme.mjs, one file further in. README.md
 * types its numbers because it is markdown read on GitHub with no build step to
 * substitute into; CLAUDE.md types its numbers because it is a record read by a
 * person and an agent, and substituting into it would make it unreadable as
 * prose. Both therefore state numbers, and both need something asking whether
 * the numbers are still true.
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK. The to-do items in § Next up are the
 * things that actually drifted, and they are also the things written to be
 * deleted once done, so a pattern anchored to one would fail the build on the
 * day someone correctly removed it. Checking those would train exactly the
 * habit this repo is built against, which is skipping a gate that cries wolf.
 * So the claims below are the ones that survive their own subject matter: what
 * the checksums are, and how many brands there are.
 *
 * EVERY CHECKSUM IS READ FROM THE SCRIPT THAT PRINTS IT, never recomputed here.
 * A second implementation of a hash is the precise drift the rest of design/
 * exists to stop, and this repo has already paid for a second copy of a rule
 * once, in the endsWith matcher that let IconButton cover for Button. Running
 * the real script is also what the file tells a human to do.
 *
 *   node design/verify-claude-md.mjs
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const doc = readFileSync('CLAUDE.md', 'utf8');

const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const word = (n) => WORDS[n] ?? String(n);

const problems = [];

/**
 * Run a script and read the checksum it prints.
 *
 * Every one of these already runs inside the gate, so this is the second time
 * in a full verify:all and the cost is a few seconds against a class of error
 * that has landed three times.
 *
 * build-code-specs.mjs is a generator rather than a check and does write its
 * specs. That is safe here and only here: verify-generated.mjs runs earlier in
 * the same gate and asserts that regenerating everything changes nothing, so by
 * the time this executes, the write has already been proven inert. Run on its
 * own against a dirty tree it would restage those specs, which is what the
 * pre-commit hook does deliberately anyway.
 */
const ran = new Map();

function printed(script, label) {
  if (!ran.has(script)) {
    ran.set(script, execFileSync('node', [script], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  }
  /* Leading whitespace allowed: verify-brands.mjs indents its checksum under
     the pack it belongs to, and anchoring hard to column 0 silently found
     nothing rather than failing loudly. */
  const m = ran.get(script).match(new RegExp(`^\\s*${label}\\s*:\\s*(\\d+)`, 'm'));
  if (!m) throw new Error(`${script} printed no ${label} line — has its output changed shape?`);
  return Number(m[1]);
}

const printedChecksum = (script) => printed(script, 'checksum');

/** The brands this build serves. Parsed, because brands.ts is TypeScript. */
function brandCount() {
  const src = readFileSync('src/data/brands.ts', 'utf8');
  const m = src.match(/export const BRANDS = \[([^\]]*)\]/);
  if (!m) throw new Error('could not find BRANDS in src/data/brands.ts');
  return (m[1].match(/'[^']+'/g) ?? []).length;
}

/**
 * Each claim names what it is, what the repo says, and a pattern that finds the
 * number in the prose. A pattern that stops matching is itself a failure: the
 * sentence was rewritten and nobody re-checked the figure it carried.
 */
const CLAIMS = [
  {
    what: 'tokens checksum',
    expected: () => printedChecksum('tokens/verify.mjs'),
    re: /checksum-verified against it \(`(\d+)`/,
    fix: 'node tokens/verify.mjs'
  },
  {
    what: 'tokens checksum (§ Contracts)',
    expected: () => printedChecksum('tokens/verify.mjs'),
    re: /\*\*Four checksums, four sources\.\*\* Tokens `(\d+)`/,
    fix: 'node tokens/verify.mjs'
  },
  {
    what: 'Figma components checksum',
    expected: () => printedChecksum('design/verify.mjs'),
    re: /reproduces from inside Figma: \*\*`(\d+)`\*\*/,
    fix: 'node design/verify.mjs'
  },
  {
    what: 'Figma components checksum (§ Contracts)',
    expected: () => printedChecksum('design/verify.mjs'),
    re: /Figma components `(\d+)`/,
    fix: 'node design/verify.mjs'
  },
  {
    what: 'banding checksum',
    expected: () => printedChecksum('design/verify-bands.mjs'),
    re: /Banding spec `(\d+)`/,
    fix: 'npm run verify:bands  (needs dist/, so build first)'
  },
  {
    what: 'code-only specs checksum',
    expected: () => printedChecksum('design/build-code-specs.mjs'),
    re: /Code-only specs print \*\*`(\d+)`\*\*/,
    fix: 'node design/build-code-specs.mjs'
  },
  /*
    THE TWO NUMBERS BESIDE THAT CHECKSUM, added 2026-08-26, and they earned
    their place the same day: the sentence read "across 10 components and 324
    entries" while the build printed 11 and 457. The checksum in the same
    sentence was correct, so somebody had carried the one figure a check was
    looking at and left the two beside it, which is this repo's oldest bug in
    its smallest form. It is also exactly the shape the README's own bug took —
    a right total above a short list — and the reason verify-readme.mjs counts
    the bullets as well as the number.
  */
  {
    what: 'code-only components',
    expected: () => printed('design/build-code-specs.mjs', 'components'),
    re: /Code-only specs print \*\*`\d+`\*\* across (\d+) components/,
    fix: 'node design/build-code-specs.mjs'
  },
  {
    what: 'code-only entries',
    expected: () => printed('design/build-code-specs.mjs', 'entries'),
    re: /Code-only specs print \*\*`\d+`\*\* across \d+ components and (\d+) entries/,
    fix: 'node design/build-code-specs.mjs'
  },
  {
    what: 'brand pack checksum',
    expected: () => printedChecksum('tokens/verify-brands.mjs'),
    re: /\*\*`(\d+)` across 107 entries, reproduced from inside Wise/,
    fix: 'node tokens/verify-brands.mjs'
  },
  {
    what: 'brands (§ Brands)',
    expected: brandCount,
    re: /\*\*One build serves (\w+) brands, chosen by hostname\.\*\*/,
    parse: (m) => WORDS.indexOf(m[1].toLowerCase()),
    fix: 'src/data/brands.ts is the one list'
  },
  {
    what: 'brands (§ Next up)',
    expected: brandCount,
    re: /no gaps rendering on any live page, (\w+) brands live/,
    parse: (m) => WORDS.indexOf(m[1].toLowerCase()),
    fix: 'src/data/brands.ts is the one list'
  }
];

const resolved = [];

for (const c of CLAIMS) {
  const m = doc.match(c.re);
  if (!m) {
    problems.push(
      `${c.what}: the sentence stating it has changed shape — re-check the figure ` +
        `with \`${c.fix}\`, then fix the pattern in this file`
    );
    continue;
  }
  let expected;
  try {
    expected = c.expected();
  } catch (err) {
    problems.push(`${c.what}: could not resolve the real value — ${err.message}`);
    continue;
  }
  const found = c.parse ? c.parse(m) : Number(m[1]);
  resolved.push({ what: c.what, value: expected });
  if (found !== expected) {
    problems.push(
      `${c.what}: CLAUDE.md says ${found === -1 ? `"${m[1]}"` : found}, actual is ${expected}` +
        `${c.parse ? ` (${word(expected)})` : ''} — re-read it with \`${c.fix}\``
    );
  }
}

if (problems.length) {
  console.error(`\nCLAUDE.md is out of date — ${problems.length} claim${problems.length > 1 ? 's' : ''}:`);
  problems.forEach((p) => console.error(`  ${p}`));
  console.error(
    '\n  Carry the new value up into CLAUDE.md rather than editing this check.\n' +
      '  A stale number there has landed three times, which is why this exists.\n'
  );
  process.exit(1);
}

const unique = [...new Map(resolved.map((r) => [r.what.replace(/ \(§.*/, ''), r.value])).entries()];
console.log(`\nCLAUDE.md: ${CLAIMS.length} stated numbers agree with the repo`);
console.log(`  ${unique.map(([k, v]) => `${k} ${v}`).join('  ·  ')}\n`);
