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
import { LOCKUP_PATHS, LOCKUP_VIEWBOX, MARK_PATHS, MARK_VIEWBOX, PARTNER_WORDMARKS } from '../src/components/logo-paths.ts';
import { BRANDS, DEFAULT_BRAND } from '../src/data/brands.ts';
import { TOKENS, FAVICON_OUT } from './paths.mjs';
import { loadPacks, resolvePack } from '../tokens/brands.mjs';

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

/*
  A brand pack repaints the card as well as the page, and it has to.

  The card is generated from tokens rather than drawn, which is the argument of
  this whole file, so a brand that repoints fg/primary and band/base has to
  repoint them here too. Miss it and a teal site unfurls a card in the base
  brand's near-black, on the one surface a reader sees BEFORE they open the
  site: the first impression would be the only place the theming did not reach.

  Resolution comes from tokens/brands.mjs, which css.mjs and the contrast check
  also use, rather than a third copy of merge-and-follow-aliases living here.
*/
const PACKS = loadPacks();
const EMPTY = { primitive: {}, semantic: { light: {}, dark: {} } };

function coloursFor(brand) {
  const found = PACKS.find((p) => p.brands.includes(brand));
  const light = resolvePack(found ? found.pack : EMPTY).light;
  const fg = light['fg.primary'];
  const bg = light['band.base'];
  if (!fg || !bg) throw new Error(`could not resolve fg/primary or band/base for ${brand}`);
  return { fg, bg };
}

const W = 1200;
const H = 630;

// The lockup at a size that survives the crop every client applies. 233x48 is
// the artwork; 520 wide keeps it clear of the safe area on all of them.
const LOCKUP_W = 520;
const [, , vbW, vbH] = LOCKUP_VIEWBOX.split(/\s+/).map(Number);
const LOCKUP_H = Math.round((LOCKUP_W / vbW) * vbH);

/*
  The default brand's card is the MARK, because that brand has no partner and a
  lockup with nothing to the right of its `x` reads as a card whose second half
  failed to load.

  ITS SIZE IS DERIVED RATHER THAN CHOSEN: the square with the same area as the
  lockup's box, round(sqrt(520 x 107)) = 236. Matching the lockup's HEIGHT
  instead would have been the obvious rule and is the wrong one — it renders the
  disc at exactly the size it already is inside a partner lockup, which is
  correct as a family resemblance and far too small as the only object on a
  1200x630 field. Matching area is what keeps the five cards feeling like one
  set when they are seen days apart in different conversations, which is the
  only way anybody ever sees them.
*/
const MARK_W = Math.round(Math.sqrt(LOCKUP_W * LOCKUP_H));
const [, , markVbW, markVbH] = MARK_VIEWBOX.split(/\s+/).map(Number);

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
 * Only the logotype differs between partner cards: the disc, the script and the
 * `x` are shared in LOCKUP_PATHS, and PARTNER_WORDMARKS holds each partner's
 * logotype in the same 0 0 233 48 viewBox.
 *
 * The DEFAULT brand is not in that map and takes a different shape rather than a
 * different path, since 2026-08-26. It has no partner, so its card is the mark
 * alone — see MARK_W above. Until then the default WAS a partner in all but
 * name: Revolut held the slot, its logotype was the last entry of LOCKUP_PATHS,
 * and the card that unfurled from the apex in somebody's messages carried
 * another company's mark.
 */
const artworkFor = (brand) =>
  brand === DEFAULT_BRAND
    ? { paths: MARK_PATHS, vbW: markVbW, vbH: markVbH, w: MARK_W }
    : { paths: [...LOCKUP_PATHS, PARTNER_WORDMARKS[brand]], vbW, vbH, w: LOCKUP_W };

const pub = join(root, FAVICON_OUT);
mkdirSync(pub, { recursive: true });

for (const brand of BRANDS) {
  const { fg, bg } = coloursFor(brand);
  const art = artworkFor(brand);
  const paths = art.paths
    .map((p) => `<path d="${p.d}"${p.evenOdd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`)
    .join('');

  /* Centred on the artwork's own box, so the two shapes each land in the middle
     of the card rather than one of them inheriting the other's offsets. */
  const scale = art.w / art.vbW;
  const artH = Math.round(scale * art.vbH);
  const x = Math.round((W - art.w) / 2);
  const y = Math.round((H - artH) / 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
<g transform="translate(${x} ${y}) scale(${scale})" fill="${fg}">${paths}</g>
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
  console.log(`${file.padEnd(20)} ${W}x${H}, art ${art.w}x${artH}, ${fg} on ${bg}`);
}