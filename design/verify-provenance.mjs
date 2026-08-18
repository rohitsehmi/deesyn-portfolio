#!/usr/bin/env node
/**
 * Every image in src/assets/ must say what it is.
 *
 * This is the one hazard in the repo that had a published rule and no
 * mechanism. `design/usage-rules.json` says "Never fake a product UI out of
 * rectangles. Use a real screenshot or nothing", `anti-slop` repeats it, and
 * neither can be enforced: every other check here reads text or tokens, and a
 * faked interface is a claim baked into a picture. Four reconstructions shipped
 * before anyone opened them, and a note asserting the opposite of what the
 * Hotels.com captures actually contain sat in the record until someone did.
 *
 * WHAT THIS DOES NOT DO, and the distinction is the whole point: it cannot tell
 * whether a claim is TRUE. A person still has to open the file. What it removes
 * is the option of never being asked — an unclassified asset fails the build,
 * so the claim is made once, in writing, at the moment the file lands rather
 * than months later from memory. Exactly the trade `Metrics` makes by requiring
 * `source`: nothing checks the number, something checks that you said where it
 * came from.
 *
 * It also refuses ORPHANS — an entry naming a file that no longer exists. A
 * manifest that keeps describing deleted artwork rots into fiction, and the
 * next person reads it as a record of what is there.
 *
 * Reconstructions do not fail. They are accepted work and Rohit accepted them
 * knowingly. They ARE printed on every run, because the failure mode of an
 * accepted risk is that it stops being visible and quietly becomes an
 * assumption — the same reason `verify.mjs` prints deprecated components rather
 * than dropping them.
 *
 *   node design/verify-provenance.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ASSETS_DIR } from './paths.mjs';

const root = new URL('../', import.meta.url).pathname;
const MANIFEST = 'design/asset-provenance.json';

/** What the build actually processes. Anything else in there is not artwork. */
const IMAGE = /\.(png|jpe?g|webp|avif|svg|gif)$/i;

const KINDS = new Set(['capture', 'reconstruction', 'diagram', 'illustration']);

/* A note has to carry what a person saw. Nothing can measure that, but a
   one-word placeholder is the shape a skipped question takes, so the floor is
   set where "ok", "n/a" and "tbd" fall under it and a real sentence does not. */
const MIN_NOTE = 24;

const manifest = JSON.parse(readFileSync(root + MANIFEST, 'utf8'));
const declared = manifest.assets ?? {};

const onDisk = readdirSync(root + ASSETS_DIR)
  .filter((name) => IMAGE.test(name))
  .sort();

const errors = [];

/* ---- every file is declared ---- */
for (const file of onDisk) {
  const entry = declared[file];
  if (!entry) {
    errors.push(`${file} — not in ${MANIFEST}. Open it, then add an entry saying what it is.`);
    continue;
  }
  if (!KINDS.has(entry.kind)) {
    errors.push(`${file} — kind "${entry.kind ?? '(missing)'}" is not one of: ${[...KINDS].join(', ')}`);
  }
  const note = (entry.note ?? '').trim();
  if (note.length < MIN_NOTE) {
    errors.push(`${file} — note is missing or too short. Say what you saw when you opened it.`);
  }
}

/* ---- and every declaration is a file ---- */
const present = new Set(onDisk);
for (const file of Object.keys(declared)) {
  if (!present.has(file)) {
    errors.push(`${file} — declared in ${MANIFEST} but not in ${ASSETS_DIR}/. Remove the entry.`);
  }
}

/* ---- report ---- */
const byKind = (kind) => onDisk.filter((f) => declared[f]?.kind === kind);

if (errors.length) {
  console.error(`\nasset provenance — ${errors.length} problem${errors.length > 1 ? 's' : ''}:`);
  errors.forEach((e) => console.error(`  ${e}`));
  console.error('');
  process.exit(1);
}

const reconstructions = byKind('reconstruction');
if (reconstructions.length) {
  console.log(`\nreconstructions — ${reconstructions.length}, accepted and live. These imitate a real`);
  console.log('interface, so they carry the cost the screenshot rule exists to avoid:');
  reconstructions.forEach((f) => console.log(`  ${f}`));
}

const counts = [...KINDS]
  .map((k) => `${k} ${byKind(k).length}`)
  .join('  ');

console.log(`\nasset provenance: ${onDisk.length} images, all declared`);
console.log(`  ${counts}\n`);