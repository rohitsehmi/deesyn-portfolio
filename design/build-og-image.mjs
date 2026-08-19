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
// Brand pack. Static, so it cannot take a runtime path — see LOGO_PATHS in
// paths.mjs for why converting it early would buy an untested code path.
import { LOCKUP_PATHS, LOCKUP_VIEWBOX, PARTNER_WORDMARKS } from '../src/components/logo-paths.ts';
import { BRANDS, DEFAULT_BRAND } from '../src/data/brands.ts';
import { TOKENS, FAVICON_OUT } from './paths.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, TOKENS), 'utf8'));

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

/**
 * One card per brand.
 *
 * `og:image` is a single build-time URL and the brand is decided at runtime by
 * a script, so a crawler — which runs no JavaScript — cannot be shown the right
 * card by the page alone. That was left as an open cost: /og.png was the
 * Revolut lockup on the Wise and Healf hostnames too.
 *
 * It is fixed at the edge instead. Each brand gets its own file, and vercel.json
 * rewrites /og.png per host, which happens server-side and so applies to a
 * crawler exactly as it does to a browser. The tag in the HTML stays one URL.
 *
 * Only the LAST path differs: the disc, the script and the `x` are shared, and
 * PARTNER_WORDMARKS holds the partner logotype in the same 0 0 233 48 viewBox.
 * Revolut is not in that map because its logotype IS the last entry of
 * LOCKUP_PATHS — the default, and what a client with no JavaScript renders.
 */
const shared = LOCKUP_PATHS.slice(0, -1);
const lockupFor = (brand) =>
  brand === DEFAULT_BRAND ? LOCKUP_PATHS : [...shared, PARTNER_WORDMARKS[brand]];

const pub = join(root, FAVICON_OUT);
mkdirSync(pub, { recursive: true });

for (const brand of BRANDS) {
  const paths = lockupFor(brand)
    .map((p) => `<path d="${p.d}"${p.evenOdd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
<g transform="translate(${x} ${y}) scale(${LOCKUP_W / vbW})" fill="${fg}">${paths}</g>
</svg>
`;
  /*
    EVERY brand gets a suffixed name, the default included, and shipping no
    bare og.png is the point rather than a side effect.

    The first version of this let Revolut keep the plain name on the reasoning
    that the default needs no entry, the same rule as [data-brand] carrying no
    attribute. That rule holds in CSS and does not survive the trip to Vercel's
    router: REWRITES ARE MATCHED AFTER THE FILESYSTEM, so a real dist/og.png
    answered every request and the per-host rewrites never ran. The feature
    shipped on 2026-08-18 and did nothing until 2026-08-19, and it could not
    look wrong from here — the file was correct, the rewrite was correct, and
    the ordering that joins them is written down in neither.

    With no file at /og.png every host resolves through a rule, including the
    default one. verify-vercel-config.mjs fails the build if this regresses.
  */
  const file = `og-${brand}.png`;
  await sharp(Buffer.from(svg), { density: 384 }).resize(W, H).png().toFile(join(pub, file));
  console.log(`${file.padEnd(20)} ${W}x${H}, lockup ${LOCKUP_W}x${LOCKUP_H}, ${fg} on ${bg}`);
}