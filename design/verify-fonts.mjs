/**
 * Asserts that every typeface the token scale NAMES actually SHIPS.
 *
 *   node design/verify-fonts.mjs
 *
 * WHY THIS EXISTS, and it is the sharpest example in the repo of a check
 * measuring the wrong thing. verify-css.mjs already asserted that every font
 * value in src/ binds to a var(--type-*) rather than being typed by hand, and
 * it passed for weeks — while the site loaded NO WEBFONT AT ALL. Every visitor
 * read a 23-style scale, exported from Figma with Hanken Grotesk as the display
 * face, in whatever system-ui resolves to on their operating system.
 *
 * BINDING IS NOT ARRIVING. That is the whole lesson and it is the same shape as
 * every other failure on record here: the vercel.json key that validated for
 * weeks, the og.png rewrite that was correct and unreachable, three stale
 * checksums. Each check asked a true question adjacent to the one that
 * mattered.
 *
 * IT ALSO SURVIVED BECAUSE THE OBVIOUS RUNTIME TEST LIES. document.fonts.check()
 * returns true for any family Chrome cannot disprove, so a console poke says the
 * font is fine when nothing has loaded. The only honest runtime check is to
 * MEASURE — render a string in the family and again in a nonsense family and
 * compare widths. That is how the bug was found:
 *
 *     'Hanken Grotesk', monospace   1584.27
 *     'Inter', monospace            1584.27
 *     'No Such Font XYZ', monospace 1584.27   <- identical: all fall through
 *     system-ui                     1167.73
 *
 * This check is the STATIC half of that and deliberately not the measurement:
 * measuring needs a real browser and a running server, which is the same reason
 * measure-media-contrast.mjs is kept out of the gate. What it can do without a
 * browser is prove the chain is complete — every family the tokens name has an
 * @font-face, every @font-face points at a file that exists, and nothing points
 * at a third-party host. A broken chain cannot render, so this catches the
 * regression that actually happened.
 *
 * NO NETWORK, ever, for the same reason verify-vercel-config.mjs vendors its
 * allowlist: a check that needs the network goes red on a train and puts
 * somebody else's uptime between this repo and a green build.
 */
import { readFileSync, existsSync } from 'node:fs';

const TOKENS = 'src/styles/tokens.css';
const FONTS = 'src/styles/fonts.css';
const BASE = 'src/layouts/Base.astro';
const PUBLIC = 'public';

const problems = [];

if (!existsSync(FONTS)) {
  console.error(`\n${FONTS} is missing — run \`node design/build-fonts.mjs\`\n`);
  process.exit(1);
}

const tokens = readFileSync(TOKENS, 'utf8');
const fonts = readFileSync(FONTS, 'utf8');
const base = readFileSync(BASE, 'utf8');

/* Families the scale names, first-listed only: the rest of a stack is fallback
   and is supposed to be a system face. */
const named = new Set();
for (const m of tokens.matchAll(/--type-[a-z0-9-]+-family:\s*([^;]+);/g)) {
  const first = m[1].split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  if (first && !/^(system-ui|sans-serif|serif|monospace|ui-|-apple)/.test(first)) named.add(first);
}
if (!named.size) problems.push(`no font families parsed out of ${TOKENS} — the parser has drifted`);

/* Families declared, and the files they point at. */
const declared = new Map();
for (const blk of fonts.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
  const fam = /font-family:\s*['"]([^'"]+)['"]/.exec(blk[1]);
  const src = /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(blk[1]);
  if (!fam || !src) { problems.push('an @font-face block has no family or no src'); continue; }
  if (!declared.has(fam[1])) declared.set(fam[1], []);
  declared.get(fam[1]).push(src[1]);

  if (!/font-display:\s*swap/.test(blk[1]))
    problems.push(`${fam[1]}: no \`font-display: swap\` — a slow connection would hide the text`);
  if (/^https?:/i.test(src[1]))
    problems.push(`${fam[1]}: src points at ${src[1]} — fonts are self-hosted so no visitor's IP reaches a third party`);
}

for (const fam of named) {
  if (!declared.has(fam)) {
    problems.push(
      `"${fam}" is named by the type scale but has NO @font-face — every reader would ` +
        `get a system fallback, which is the exact bug this check exists for`
    );
    continue;
  }
  for (const url of declared.get(fam)) {
    const path = `${PUBLIC}${url.startsWith('/') ? '' : '/'}${url}`;
    if (!existsSync(path)) problems.push(`"${fam}" declares ${url} but ${path} does not exist`);
  }
}

/* A preload that names a file we do not ship is worse than no preload.
   Matched as a whole <link> element rather than from the rel= onwards: the tag
   is written across several lines, so a one-line match drops the attributes
   after href and reports a missing crossorigin that is right there. That was a
   real false positive on this check's first run. */
const LINK = /<link\b[^>]*>/gs;
for (const tag of base.match(LINK) ?? []) {
  if (!/rel=["']preload["']/.test(tag)) continue;
  const href = /href=["']([^"']+\.woff2?)["']/.exec(tag);
  if (!href) continue;
  const path = `${PUBLIC}${href[1]}`;
  if (!existsSync(path)) problems.push(`Base.astro preloads ${href[1]} but ${path} does not exist`);
  if (!/\bcrossorigin\b/.test(tag)) problems.push(`${href[1]} is preloaded without crossorigin — it would be fetched twice`);
}
/* Only a real <link>, never prose. The first version matched the comment
   EXPLAINING that the preconnect had been removed, which is the same trap as
   matching a substring instead of a whole value. */
for (const tag of base.match(LINK) ?? []) {
  if (/rel=["']preconnect["']/.test(tag) && /fonts\.(googleapis|gstatic)/.test(tag))
    problems.push('Base.astro still preconnects to Google Fonts — nothing requests from it since fonts were self-hosted');
}

if (problems.length) {
  console.error(`\nfonts: ${problems.length} problem${problems.length > 1 ? 's' : ''}`);
  problems.forEach((p) => console.error(`  ${p}`));
  console.error('\n  Regenerate with `node design/build-fonts.mjs` (needs the network).');
  console.error('  Binding a font is not loading one — see the header of this file.\n');
  process.exit(1);
}

const files = [...new Set([...declared.values()].flat())];
console.log(`\nfonts: ${named.size} famil${named.size === 1 ? 'y' : 'ies'} named by the scale, all declared and present`);
for (const fam of named) console.log(`  ${fam.padEnd(18)} ${declared.get(fam).length} subset(s)`);
console.log(`  ${files.length} file(s) in ${PUBLIC}/fonts, self-hosted, font-display: swap`);
console.log('  NB this proves the chain is complete, never that a glyph rendered —');
console.log('  document.fonts.check() lies, so measure widths in a browser to be sure.\n');
