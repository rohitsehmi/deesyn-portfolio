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
 * The tab strip is not the page. A navy disc on a dark tab is the tab, which
 * is what "the favicon has gone" looked like on 2026-10-19 and again the next
 * day. The icon is a light tile with the mark on it, in every file, with no
 * stylesheet inside the SVG. A style block is what some browsers refuse to
 * paint, and a refused SVG leaves the tab empty even when the PNG beside it
 * is fine. The PNG is listed first for that reason.
 *
 * favicon.ico is a real bitmap, not a PNG wrapped in an ICO header. Safari
 * does not decode the wrapped kind and then shows nothing.
 *
 * favicon.png is 192px and its URL does not carry a query string. Google
 * Search ignores SVG favicons, wants a PNG larger than 48px, and drops an
 * icon whose address keeps changing. The browser links can still be versioned.
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
  return `<path fill="${light}" d="${path.d}"${rule}/>`;
}).join('');

/* A full light square, then the disc inset, so a dark tab shows a tile. */
const art = `<rect width="48" height="48" fill="${dark}"/><g transform="translate(6 6) scale(0.75)">${shapes}</g>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" role="img" aria-label="deesyn">${art}</svg>
`;

const pub = join(root, FAVICON_OUT);
mkdirSync(pub, { recursive: true });
writeFileSync(join(pub, 'favicon.svg'), svg);

const flat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}">${art}</svg>`;
for (const [name, size] of [['favicon-32.png', 32], ['favicon.png', 192], ['apple-touch-icon.png', 180]]) {
  await sharp(Buffer.from(flat), { density: 384 }).resize(size, size).png().toFile(join(pub, name));
}

/* Classic ICO: a DIB, bottom-up, plus an AND mask. Width 0 in the directory
   means 256, so 16 and 32 are written as themselves. */
function dib(raw, size) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  const xor = Buffer.alloc(size * size * 4);
  const stride = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const src = ((size - 1 - y) * size + x) * 4;
      const dst = (y * size + x) * 4;
      xor[dst] = raw[src + 2];
      xor[dst + 1] = raw[src + 1];
      xor[dst + 2] = raw[src];
      xor[dst + 3] = raw[src + 3];
    }
  }
  return Buffer.concat([header, xor, mask]);
}

const images = [];
for (const size of [16, 32]) {
  const raw = await sharp(Buffer.from(flat), { density: 384 }).resize(size, size).ensureAlpha().raw().toBuffer();
  images.push({ size, data: dib(raw, size) });
}
const dir = Buffer.alloc(6);
dir.writeUInt16LE(0, 0);
dir.writeUInt16LE(1, 2);
dir.writeUInt16LE(images.length, 4);
let offset = 6 + images.length * 16;
const entries = images.map(({ size, data }) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([dir, ...entries, ...images.map((image) => image.data)]));

console.log(`favicon.svg          Ro mark, ${light} / ${dark}`);
console.log('favicon.png          192x192');
console.log('favicon-32.png       32x32');
console.log('apple-touch-icon.png 180x180');
console.log('favicon.ico          32x32');
