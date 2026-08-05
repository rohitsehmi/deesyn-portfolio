/**
 * Measures the real contrast of hero foregrounds over media, off the rendered
 * page, glyph by glyph.
 *
 *   npm run build && npx astro preview --port 4321   # in another shell
 *   node design/measure-media-contrast.mjs
 *
 * Why this exists
 * ---------------
 * Everything else in `design/` checks that a value came from a token. None of
 * it can tell you whether text is legible on a photograph, because that is a
 * property of the picture and not of the system. A band guarantees its own
 * contrast; media cannot, and an unscrimmed hero has nothing between the type
 * and whatever the image happens to be doing at that point.
 *
 * So this is the one check that measures pixels. It is not wired into `verify`:
 * it needs a running preview server and a real browser, and it is the answer to
 * "we changed the hero image", not something every commit should pay for.
 *
 * Method
 * ------
 * Two mistakes are easy here and both flatter the result.
 *
 * 1. Measuring the text's bounding box measures the gaps between words and the
 *    whole ragged right edge of a heading. Under a heavy scrim that is
 *    harmless. Unscrimmed it is the entire question: it will report a failure
 *    for a dark shape that sits inside the box but behind no letter.
 *
 *    So build a real glyph mask. Render the text once forced pure white and
 *    once forced pure black over an identical backdrop. For any pixel
 *      W = a*255 + (1-a)*N   and   B = a*0 + (1-a)*N
 *    so a = (W - B) / 255 exactly, with no dependence on the backdrop N.
 *    Antialiased edges are then excluded at a >= 0.9: WCAG is about the stroke,
 *    and every typeface on earth fails on its own edge pixels.
 *
 * 2. Measuring one frame. The image drifts under the text as the page scrolls,
 *    so a hero that passes at rest can fail 140px later. Sampled across the
 *    range, and frames where the text has left the hero or gone under the fixed
 *    nav are skipped rather than scored — those report 1.00:1 against the white
 *    page below and look like a catastrophe that is really a bug in here.
 */
// playwright-core, not playwright: it drives the Chrome already on the machine
// via `channel`, and never downloads a browser on install. sharp is declared
// explicitly rather than borrowed from Astro's image service, which happens to
// depend on it today and is not a contract.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = process.env.PREVIEW_URL ?? 'http://localhost:4321/';
const AA = 4.5;
const TARGETS = [
  { name: 'hero heading', sel: '.home-hero__title' },
  { name: 'hero standfirst', sel: '.home-hero__standfirst' }
];
const VIEWPORTS = [
  { width: 1728, height: 1000 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 }
];
const SCROLLS = [0, 80, 160, 240, 320];

const chan = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const raw = async (p) => { const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true }); return { data, ch: info.channels, w: info.width }; };

/** Resolves the computed colour of an element to [r,g,b] already composited. */
const parse = (css) => {
  const m = css.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) throw new Error(`cannot parse colour: ${css}`);
  return { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] };
};

const dir = mkdtempSync(join(tmpdir(), 'media-contrast-'));
const browser = await chromium.launch({ channel: 'chrome' });
const rows = [];
let skipped = 0;

try {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Assert this is a built preview, not a dev server. `astro preview` exits
    // quietly if the port is taken, so a stale `astro dev` left running from a
    // previous day silently answers every request instead — with a 200, which
    // is why curl does not catch it. Worse, the dev image endpoint serves
    // /_image?href=<path>&w=&h=&f=, a URL keyed on the path and dimensions
    // rather than the bytes, under cache-control: max-age=31536000. Replace an
    // image in place with one of the same dimensions and every browser holding
    // that URL keeps the old picture for a year.
    const served = await page.evaluate(() => document.querySelector('.parallax__image')?.currentSrc ?? '');
    if (served.includes('/_image?href=')) {
      throw new Error(
        `${URL} is an astro dev server, not a built preview.\n` +
        '  Run `npm run build`, then `npx astro preview` — and check it actually bound to the port.\n' +
        '  Measurements against dev are usually right but are not what ships, and the dev image\n' +
        '  endpoint caches by URL rather than by content.'
      );
    }

    // The real colours, before anything is forced, and the hero's own box.
    const colours = await page.evaluate((TARGETS) => Object.fromEntries(
      TARGETS.map(({ sel }) => [sel, getComputedStyle(document.querySelector(sel)).color])
    ), TARGETS);

    // Fixed chrome sits over the rects being sampled and is not the media.
    await page.evaluate(() => document.querySelectorAll('*')
      .forEach((n) => { if (getComputedStyle(n).position === 'fixed') n.style.visibility = 'hidden'; }));

    const shot = async (mode, path) => {
      await page.evaluate(({ TARGETS, mode }) => {
        for (const { sel } of TARGETS) {
          const el = document.querySelector(sel);
          el.style.visibility = mode === 'hidden' ? 'hidden' : 'visible';
          el.style.color = mode === 'white' ? '#fff' : mode === 'black' ? '#000' : '';
          el.style.opacity = mode === 'hidden' ? '' : '1';
        }
      }, { TARGETS, mode });
      await page.waitForTimeout(110);
      await page.screenshot({ path, clip: { x: 0, y: 0, width: vp.width, height: vp.height } });
    };

    for (const scroll of SCROLLS) {
      await page.evaluate((v) => window.scrollTo(0, v), scroll);
      await page.waitForTimeout(200);

      const geo = await page.evaluate((TARGETS) => {
        const hero = document.querySelector('[data-on-media]');
        if (!hero) return null;
        const h = hero.getBoundingClientRect();
        return {
          hero: { top: h.top, bottom: h.bottom },
          rects: Object.fromEntries(TARGETS.map(({ sel }) => {
            const b = document.querySelector(sel).getBoundingClientRect();
            return [sel, { x: b.x, y: b.y, w: b.width, h: b.height, top: b.top, bottom: b.bottom }];
          }))
        };
      }, TARGETS);
      if (!geo) continue;

      // Only score frames a reader actually reads.
      const usable = TARGETS.every(({ sel }) => {
        const r = geo.rects[sel];
        return r.top >= 0 && r.bottom <= Math.min(vp.height, geo.hero.bottom) && r.top >= geo.hero.top;
      });
      if (!usable) { skipped++; continue; }

      await shot('hidden', join(dir, 'N.png'));
      await shot('white', join(dir, 'W.png'));
      await shot('black', join(dir, 'B.png'));
      await page.evaluate(({ TARGETS }) => TARGETS.forEach(({ sel }) => {
        const el = document.querySelector(sel);
        el.style.visibility = ''; el.style.color = ''; el.style.opacity = '';
      }), { TARGETS });

      const [N, W, B] = await Promise.all([raw(join(dir, 'N.png')), raw(join(dir, 'W.png')), raw(join(dir, 'B.png'))]);

      for (const { name, sel } of TARGETS) {
        const { rgb, a } = parse(colours[sel]);
        const r = geo.rects[sel];
        const ls = [];
        for (let y = Math.round(r.y); y < Math.round(r.y + r.h); y++) {
          for (let x = Math.round(r.x); x < Math.round(r.x + r.w); x++) {
            const i = (y * N.w + x) * N.ch;
            if ((W.data[i + 1] - B.data[i + 1]) / 255 < 0.9) continue;
            const bg = [N.data[i], N.data[i + 1], N.data[i + 2]];
            ls.push(ratio(lum(bg.map((v, k) => rgb[k] * a + v * (1 - a))), lum(bg)));
          }
        }
        if (!ls.length) continue;
        ls.sort((p, q) => p - q);
        rows.push({
          vp: vp.width, scroll, name,
          worst: ls[0],
          p01: ls[Math.floor((ls.length - 1) * 0.01)],
          median: ls[Math.floor((ls.length - 1) * 0.5)],
          px: ls.length,
          failing: ls.filter((v) => v < AA).length
        });
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}

const f = (n) => n.toFixed(2).padStart(6);
console.log('\nglyph-core pixels only (coverage >= 0.9), contrast against the composited backdrop\n');
console.log('vp     scroll  element              worst    p01 median   glyph px   < 4.5:1');
console.log('-'.repeat(76));
for (const r of rows) {
  console.log(`${String(r.vp).padEnd(7)}${String(r.scroll).padEnd(8)}${r.name.padEnd(20)}${f(r.worst)} ${f(r.p01)} ${f(r.median)}   ${String(r.px).padStart(8)}   ${(r.failing / r.px * 100).toFixed(1).padStart(5)}%`);
}

console.log(`\nframes scored: ${rows.length / TARGETS.length}, skipped (text off the media): ${skipped}`);
let bad = false;
for (const { name } of TARGETS) {
  const rs = rows.filter((r) => r.name === name);
  if (!rs.length) continue;
  const worst = Math.min(...rs.map((r) => r.worst));
  const failing = rs.reduce((s, r) => s + r.failing, 0);
  const total = rs.reduce((s, r) => s + r.px, 0);
  const ok = failing / total < 0.001;
  if (!ok) bad = true;
  console.log(`  ${name.padEnd(20)} worst glyph pixel ${worst.toFixed(2)}:1, ${(failing / total * 100).toFixed(2)}% below AA — ${ok ? 'PASS' : 'FAIL'}`);
}
console.log(bad ? '\nFAIL — the foreground does not clear AA over this image.' : '\nPASS — every foreground clears AA over this image, at every frame scored.');
process.exit(bad ? 1 : 0);
