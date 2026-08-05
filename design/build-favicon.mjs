/**
 * Generates the favicon set from the brand mark and the tokens.
 *
 *   node design/build-favicon.mjs
 *
 * Why generated rather than drawn: the mark already exists once, exported from
 * Figma into src/components/logo-paths.ts, and a favicon traced by hand is a
 * second copy of the artwork that drifts the first time the logo changes. This
 * reads the same path data the Logo component renders, so it cannot.
 *
 * The one thing it must hardcode is colour, and that is worth being explicit
 * about. A standalone favicon is fetched by the browser outside the page, so it
 * has no access to the site's stylesheet and cannot use var(--semantic-*). The
 * values are therefore read out of tokens/tokens.json at build time and inlined
 * — resolved from the token, never typed in.
 *
 * The SVG is theme-aware, which matters more here than on the page: a favicon
 * sits on the browser's tab strip, not on the site's background, so a dark mark
 * disappears into a dark tab. `prefers-color-scheme` inside the SVG is honoured
 * by Chrome, Safari and Firefox for favicons.
 *
 * The PNG fallbacks cannot be theme-aware, so they take the light-mode fill —
 * the one that reads on the white-ish surfaces iOS and legacy browsers
 * composite onto.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MARK_PATHS, MARK_VIEWBOX } from '../src/components/logo-paths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(join(root, 'tokens/tokens.json'), 'utf8')));

/** Follows a DTCG alias like {primitive.neutral.850} to its literal value. */
function resolve(node) {
  let v = node?.$value;
  let guard = 0;
  while (typeof v === 'string' && v.startsWith('{') && guard++ < 10) {
    const path = v.slice(1, -1).split('.');
    v = path.reduce((o, k) => o?.[k], tokens)?.$value;
  }
  return v;
}

const light = resolve(tokens.semantic.light.fg.primary);
const dark = resolve(tokens.semantic.dark.fg.primary);
if (!light || !dark) throw new Error('could not resolve semantic fg/primary from tokens.json');

const paths = MARK_PATHS.map((p) =>
  `<path d="${p.d}"${p.evenOdd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`
).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" role="img" aria-label="Rohit Sehmi">
<style>
  path { fill: ${light} }
  @media (prefers-color-scheme: dark) { path { fill: ${dark} } }
</style>
${paths}
</svg>
`;

const pub = join(root, 'public');
mkdirSync(pub, { recursive: true });
writeFileSync(join(pub, 'favicon.svg'), svg);

// Flat-fill copy for the raster fallbacks; no media query, light fill only.
const flat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}"><g fill="${light}">${paths}</g></svg>`;
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180]]) {
  await sharp(Buffer.from(flat), { density: 384 }).resize(size, size).png().toFile(join(pub, name));
}

console.log(`favicon.svg          mark, ${MARK_PATHS.length} paths, ${light} / ${dark}`);
console.log('favicon-32.png       32x32');
console.log('apple-touch-icon.png 180x180');
