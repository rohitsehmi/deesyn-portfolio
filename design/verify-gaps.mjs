#!/usr/bin/env node
/**
 * Fails if a `[NEEDS: …]` marker would render on the deployed site.
 *
 * The markers are deliberately visible on the page rather than hidden in a
 * comment, so a missing fact cannot be lost. The cost of that choice is that
 * nothing stops one shipping. This is the thing that stops one shipping.
 *
 * It reads dist/ rather than src/copy/, for the same reason verify-bands does:
 * a marker only matters if it made it onto a page. A key that no arrangement
 * renders is a note to self, not a hole in the portfolio.
 *
 * Archived studies are reported separately. They are off the index and out of
 * the next-study rotation but still build and are still reachable at their
 * URLs, so a gap there is real — just not one that blocks a submission.
 *
 *   node design/verify-gaps.mjs            # live pages fail, archived warn
 *   node design/verify-gaps.mjs --all      # archived fail too
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const failArchived = process.argv.includes('--all');

/*
  Read out of the source text rather than imported. studies.ts imports its
  cover images, and a bare `node` cannot resolve a PNG — Node strips the types
  fine, it is the assets that stop it. The shape being matched is one entry per
  line, which is how the `order` array is written.
*/
const studiesSrc = readFileSync(new URL('../src/data/studies.ts', import.meta.url), 'utf8');
const archivedSlugs = new Set(
  [...studiesSrc.matchAll(/\{\s*slug:\s*'([^']+)'[^}]*archived:\s*true[^}]*\}/g)].map((m) => m[1])
);

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? htmlFiles(path)
      : name.endsWith('.html')
        ? [path]
        : [];
  });
}

let files;
try {
  files = htmlFiles(DIST);
} catch {
  console.error('no dist/ — run `npm run build` first');
  process.exit(1);
}

// The marker as it survives Astro's HTML escaping. The ellipsis-only form in
// the _comment keys never renders, so anything matched here is on a page.
const MARKER = /\[NEEDS:/g;

const live = [];
const archived = [];

for (const file of files) {
  const url = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '');
  const count = (readFileSync(file, 'utf8').match(MARKER) || []).length;
  if (!count) continue;
  const slug = url.replace(/^\/work\//, '').replace(/\/$/, '');
  (archivedSlugs.has(slug) ? archived : live).push({ url, count });
}

const total = (list) => list.reduce((n, p) => n + p.count, 0);
const print = (list) => list.forEach((p) => console.log(`  ${String(p.count).padStart(3)}  ${p.url}`));

if (archived.length) {
  console.log(`\narchived pages — ${total(archived)} gaps, reachable but off the index:`);
  print(archived);
}

if (live.length) {
  console.log(`\nlive pages — ${total(live)} gaps that would render on the deployed site:`);
  print(live);
  console.log('');
  process.exit(1);
}

if (failArchived && archived.length) {
  console.log('');
  process.exit(1);
}

console.log(`\ngaps: none on any live page${archived.length ? ' (archived above)' : ''}\n`);