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
 * by Chrome, Safari and Firefox for favicons. A light plate sits behind the
 * disc anyway, because a browser that ignores that query would otherwise paint
 * navy on a dark tab and the icon would vanish.
 *
 * The PNG fallbacks cannot be theme-aware, so they take the light-mode fill —
 * the one that reads on the white-ish surfaces iOS and legacy browsers
 * composite onto.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
// Brand pack. Static, so it cannot take a runtime path — see LOGO_PATHS in
// paths.mjs for why converting it early would buy an untested code path.
import { MARK_PATHS, MARK_VIEWBOX } from '../src/components/logo-paths.ts';
import { TOKENS, FAVICON_OUT } from './paths.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(join(root, TOKENS), 'utf8')));

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
if (!light || !dark) throw new Error('could not resolve mark colours from tokens.json');

const shapes = MARK_PATHS.map((path) => {
  const rule = path.evenOdd ? ' fill-rule="evenodd"' : '';
  return `<path class="ink" fill="${light}" d="${path.d}"${rule}/>`;
}).join('');

/*
  The disc fills its own viewBox, so a navy mark on a dark tab is the tab.
  A plate behind it, with the disc inset, keeps a light ring and light letters
  when a browser ignores the media query. The query still flips both for a
  dark tab that does honour it.
*/
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" role="img" aria-label="deesyn">
<style>
  .plate { fill: ${dark} }
  .ink { fill: ${light} }
  @media (prefers-color-scheme: dark) {
    .plate { fill: ${light} }
    .ink { fill: ${dark} }
  }
</style>
<rect class="plate" width="48" height="48" rx="24" fill="${dark}"/>
<g transform="translate(3 3) scale(0.875)">${shapes}</g>
</svg>
`;

const pub = join(root, FAVICON_OUT);
mkdirSync(pub, { recursive: true });
writeFileSync(join(pub, 'favicon.svg'), svg);

// Flat-fill copy for the raster fallbacks; no media query, light fill only.
const flat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}"><rect width="48" height="48" rx="24" fill="${dark}"/><g transform="translate(3 3) scale(0.875)" fill="${light}">${shapes.replaceAll(/ class="ink"| fill="[^"]*"/g, '')}</g></svg>`;
const png32 = join(pub, 'favicon-32.png');
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180]]) {
  await sharp(Buffer.from(flat), { density: 384 }).resize(size, size).png().toFile(join(pub, name));
}

/* Browsers still request /favicon.ico on their own. A 404 there replaces the
   tab icon even when the SVG link is fine. The ICO wraps the 32px PNG. */
const png = await sharp(png32).png().toBuffer();
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(22, 12);
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([header, entry, png]));

console.log(`favicon.svg          Ro mark, ${light} / ${dark}`);
console.log('favicon-32.png       32x32');
console.log('apple-touch-icon.png 180x180');
console.log('favicon.ico          32x32');
