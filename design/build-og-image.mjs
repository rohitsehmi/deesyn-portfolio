/**
 * Generates the social card from the brand lockup and the tokens.
 *
 *   node design/build-og-image.mjs
 *
 * Same argument as the favicon: the lockup already exists once, exported from
 * Figma into src/components/logo-paths.ts, and a card drawn by hand is a second
 * copy of the artwork that drifts the first time the logo changes. This reads
 * the same path data the Logo component renders, and the same band fill and
 * foreground the page renders, so it cannot.
 *
 * 1200x630 is the size every unfurler crops from, and the only one worth
 * emitting. PNG rather than SVG because Slack, LinkedIn, iMessage and WhatsApp
 * all refuse SVG for og:image.
 *
 * Light only, deliberately. A social card is composited onto whatever surface
 * the reader's client uses and cannot respond to their theme, so it takes the
 * light-mode band fill and light-mode foreground — the pair that survives being
 * dropped onto a white or near-white message list.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LOCKUP_PATHS, LOCKUP_VIEWBOX } from '../src/components/logo-paths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));

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

const fg = resolve(tokens.semantic.light.fg.primary);
const bg = resolve(tokens.semantic.light.band.base);
if (!fg || !bg) throw new Error('could not resolve fg/primary or band/base from tokens.json');

const W = 1200;
const H = 630;

// The lockup at a size that survives the crop every client applies. 233x48 is
// the artwork; 520 wide keeps it clear of the safe area on all of them.
const LOCKUP_W = 520;
const [, , vbW, vbH] = LOCKUP_VIEWBOX.split(/\s+/).map(Number);
const LOCKUP_H = Math.round((LOCKUP_W / vbW) * vbH);
const x = Math.round((W - LOCKUP_W) / 2);
const y = Math.round((H - LOCKUP_H) / 2);

const paths = LOCKUP_PATHS.map(
  (p) => `<path d="${p.d}"${p.evenOdd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`
).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
<g transform="translate(${x} ${y}) scale(${LOCKUP_W / vbW})" fill="${fg}">${paths}</g>
</svg>
`;

const pub = join(root, 'public');
mkdirSync(pub, { recursive: true });
await sharp(Buffer.from(svg), { density: 384 }).resize(W, H).png().toFile(join(pub, 'og.png'));

console.log(`og.png               ${W}x${H}, lockup ${LOCKUP_W}x${LOCKUP_H}, ${fg} on ${bg}`);