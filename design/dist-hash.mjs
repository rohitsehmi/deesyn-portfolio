/**
 * Hashes the built site, so a refactor can prove it changed nothing.
 *
 *   npm run build && node design/dist-hash.mjs --save     # before
 *   …refactor…
 *   npm run build && node design/dist-hash.mjs --check    # after
 *
 * Why this exists
 * ---------------
 * The multi-brand work moves build scripts, path constants and eventually whole
 * directories around, and none of it is supposed to change a single byte the
 * reader receives. "It still builds" does not show that: the build succeeding
 * says the pipeline ran, not that it produced the same site. A page can lose a
 * stylesheet, a spec can go stale, an image can drop a srcset candidate, and
 * the build stays green.
 *
 * So the safety property is stated as a check that fails rather than as an
 * argument that it worked: hash the tree before, hash it after, and the
 * refactor is correct if and only if the two match.
 *
 * This is only sound because the build is deterministic — verified 2026-08-13,
 * two clean builds of the same tree producing the same digest. If that ever
 * stops being true this tool is worthless and silently so, which is why
 * --save records the digest twice from two separate builds and refuses to
 * write a baseline it could not reproduce.
 *
 * Not part of `npm run verify`. A baseline is a moment in a refactor, not a
 * property of the repo, and a stale one committed to CI would fail every
 * legitimate content change.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const BASELINE = 'design/.dist-baseline.json';

const mode = process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--save')
    ? 'save'
    : null;

if (!mode) {
  console.error('usage: node design/dist-hash.mjs --save | --check');
  process.exit(2);
}

if (!existsSync(DIST)) {
  console.error(`${DIST}/ does not exist. Run \`npm run build\` first.`);
  process.exit(2);
}

/** Every file under dist, relative and sorted, so the walk order cannot matter. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

/**
 * Per-file digests as well as a tree digest.
 *
 * The tree digest answers "did anything change". The per-file map answers
 * "what", which is the question you actually have at 11pm when it says no. A
 * bare mismatch tells you the refactor broke something and nothing else.
 */
function digest() {
  const files = walk(DIST).sort();
  const map = {};
  const tree = createHash('sha256');
  for (const f of files) {
    const h = createHash('sha256').update(readFileSync(f)).digest('hex');
    const rel = relative(DIST, f);
    map[rel] = h;
    tree.update(rel).update('\0').update(h).update('\0');
  }
  return { tree: tree.digest('hex'), files: map, count: files.length };
}

if (mode === 'save') {
  const a = digest();

  /*
    Rebuild and hash again before writing anything. A baseline taken from a
    single build cannot distinguish "the output is stable" from "the output is
    nondeterministic and I caught one of its values", and the second case makes
    every later --check fail for a reason that has nothing to do with the
    refactor. Better to refuse now than to mislead for a week.
  */
  process.stdout.write('verifying the build is reproducible… ');
  execFileSync('rm', ['-rf', DIST]);
  execFileSync('npm', ['run', 'build'], { stdio: 'ignore' });
  const b = digest();

  if (a.tree !== b.tree) {
    console.error('NO\n');
    console.error('Two builds of an unchanged tree produced different output, so a');
    console.error('baseline would be meaningless. Nondeterministic files:\n');
    const differing = Object.keys(a.files).filter((f) => a.files[f] !== b.files[f]);
    const onlyA = Object.keys(a.files).filter((f) => !(f in b.files));
    const onlyB = Object.keys(b.files).filter((f) => !(f in a.files));
    for (const f of differing.slice(0, 20)) console.error(`  changed  ${f}`);
    for (const f of [...onlyA, ...onlyB].slice(0, 20)) console.error(`  present in one build only  ${f}`);
    process.exit(1);
  }
  console.log('yes');

  writeFileSync(BASELINE, JSON.stringify({ savedAt: new Date().toISOString(), ...b }, null, 2) + '\n');
  console.log(`\nbaseline : ${BASELINE}`);
  console.log(`files    : ${b.count}`);
  console.log(`tree     : ${b.tree}`);
  console.log('\nRefactor, rebuild, then: node design/dist-hash.mjs --check');
}

if (mode === 'check') {
  if (!existsSync(BASELINE)) {
    console.error(`No baseline at ${BASELINE}. Take one with --save before refactoring.`);
    process.exit(2);
  }
  const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const now = digest();

  if (base.tree === now.tree) {
    const age = Math.round((Date.now() - new Date(base.savedAt)) / 60000);
    console.log(`identical to the baseline taken ${age} min ago`);
    console.log(`files    : ${now.count}`);
    console.log(`tree     : ${now.tree}`);
    console.log('\nThe refactor changed no output.');
    process.exit(0);
  }

  const changed = Object.keys(base.files).filter((f) => f in now.files && base.files[f] !== now.files[f]);
  const removed = Object.keys(base.files).filter((f) => !(f in now.files));
  const added = Object.keys(now.files).filter((f) => !(f in base.files));

  console.error('OUTPUT CHANGED\n');
  console.error(`baseline : ${base.count} files, ${base.tree.slice(0, 16)}…`);
  console.error(`now      : ${now.count} files, ${now.tree.slice(0, 16)}…\n`);
  for (const f of removed) console.error(`  removed  ${f}`);
  for (const f of added) console.error(`  added    ${f}`);
  for (const f of changed) {
    /* Size delta is usually enough to tell a lost stylesheet from a reordered
       attribute without opening anything. */
    const size = statSync(join(DIST, f)).size;
    console.error(`  changed  ${f}  (now ${size} bytes)`);
  }
  console.error(`\n${removed.length} removed, ${added.length} added, ${changed.length} changed`);
  process.exit(1);
}