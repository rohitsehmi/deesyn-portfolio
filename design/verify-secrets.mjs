#!/usr/bin/env node
/**
 * Fails if a credential is about to be committed.
 *
 * This repo is public. A token pushed here is harvested by a scanner in minutes,
 * and rewriting history to remove one is a bad afternoon — `git filter-repo`,
 * a force push, and the old objects still reachable by SHA on GitHub's side for
 * anyone who already had them. The only cheap moment is before the commit.
 *
 * It scans **tracked files only**, deliberately. `.env` is gitignored and holds
 * the real Chromatic token; flagging it would train everyone to ignore this
 * check, which is worse than not having it. What matters is the moment a value
 * moves from an ignored file into a tracked one.
 *
 *   node design/verify-secrets.mjs           # tracked files at HEAD
 *   node design/verify-secrets.mjs --staged  # what is staged right now
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const staged = process.argv.includes('--staged');

const PATTERNS = [
  // Chromatic project token. A write credential: it can publish a build, and
  // this project's Storybook is public, so that means publishing content to a
  // URL the portfolio links.
  { name: 'Chromatic project token', re: /\bchpt_[A-Za-z0-9]{10,}\b/ },
  { name: 'GitHub personal access token', re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/ },
  { name: 'GitHub fine-grained token', re: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/ },
  { name: 'Figma access token', re: /\bfigd_[A-Za-z0-9_-]{20,}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  // An assignment with a real-looking value. `FOO=` alone is fine — that is
  // what .env.example is for — so a bare or placeholder value must not trip it.
  {
    name: 'Assigned secret value',
    re: /\b[A-Z0-9_]*(TOKEN|SECRET|API_?KEY|PASSWORD)\b\s*[:=]\s*['"]?(?!$|['"]|\$|\{|<|your|xxx|placeholder|changeme)[A-Za-z0-9_\-]{16,}/i
  }
];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);

const files = staged
  ? git('diff', '--cached', '--name-only', '--diff-filter=ACM')
  : git('ls-files');

const hits = [];

for (const file of files) {
  // Skip this file, or it reports its own patterns.
  if (file === 'design/verify-secrets.mjs') continue;
  let text;
  try {
    const buf = readFileSync(file);
    if (buf.includes(0)) continue; // binary
    text = buf.toString('utf8');
  } catch {
    continue; // deleted between listing and reading
  }
  text.split('\n').forEach((line, i) => {
    for (const { name, re } of PATTERNS) {
      if (re.test(line)) hits.push({ file, line: i + 1, name });
    }
  });
}

if (hits.length) {
  console.error(`\nsecrets: ${hits.length} possible credential${hits.length > 1 ? 's' : ''} in tracked files\n`);
  // The match itself is never printed. Echoing a secret into CI logs is the
  // same mistake one step further along.
  for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.name}`);
  console.error('\nMove it to .env (gitignored) and rotate it — assume anything committed is already public.\n');
  process.exit(1);
}

console.log(`secrets   : none in ${files.length} tracked files`);