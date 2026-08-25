/**
 * Measures every text pair in the diagrams that are DRAWN rather than exported,
 * off the rendered page, in both themes and in every state they can be put into.
 *
 *   npm run build && npx astro preview --port 4321   # in another shell
 *   node design/measure-diagram-contrast.mjs
 *
 * Why this exists
 * ---------------
 * design/verify-contrast.mjs measures the SEMANTIC LAYER: it resolves tokens
 * out of tokens.json and each brand pack and asks whether the resulting pairs
 * can be read. It cannot see this diagram, and that is not a gap in it. Almost
 * every colour in these figures composes with the band under it at runtime
 * through `color-mix` — depicted brand ramps in one, a `status/danger` mixed
 * toward the page's own foreground in the other — so the only place the real
 * pair exists is a browser with a theme applied and a state selected.
 *
 * Sibling of measure-media-contrast.mjs, for the same reason and with the same
 * limitation: it needs a preview server and a real browser, so it is
 * deliberately NOT part of `npm run verify:all`. A gate that cannot run on a
 * train is a gate people learn to skip.
 *
 * WHAT IT FOUND ON ITS FIRST RUN, all of which had shipped and been looked at:
 *
 *   - The brand-row labels fell to 3.67-3.95:1 in LIGHT and passed in dark,
 *     because a selected column washes its own brand over the band and takes
 *     the background down with fg/secondary. Passing in one theme is what let
 *     it survive review.
 *   - White on Hotels.com's red measured 3.83:1 in the mark disc and 4.07:1 on
 *     the depicted button. A mid-luminance red is the one hue where white is
 *     not the safe default.
 *   - Earlier, the selection ring itself: 1.26:1 against the band for Expedia
 *     in light, against the 3:1 that WCAG 1.4.11 asks of anything identifying a
 *     component's state. It is the only thing saying which radio is on.
 *
 * TWO TRAPS IT AVOIDS, both of which flatter the result.
 *
 * Chrome reports colours in two scales: `rgb()` in 0-255 and `color(srgb ...)`
 * in 0-1 floats. Parsing both as 0-255 turns a mid red into near-black and
 * reports about 19:1 for everything, which is how the first version of this
 * measurement passed a palette that was failing.
 *
 * And a background is rarely one layer. Every plate here is translucent, so the
 * effective background is found by walking ancestors and compositing each layer
 * onto the next until an opaque one is reached. Reading the nearest
 * backgroundColor scores the wash instead of the wash over the band.
 */
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });

const AUDIT = `((sel) => {
  const parse = (s) => {
    if (!s || s === 'transparent') return null;
    const n = s.match(/[\\d.]+/g);
    if (!n) return null;
    const srgb = s.startsWith('color(');
    const rgb = n.slice(0,3).map(v => srgb ? +v * 255 : +v);
    const a = n.length > 3 ? +n[3] : 1;
    return a === 0 ? null : { rgb, a };
  };
  const over = (f, b) => f.rgb.map((v,i) => v*f.a + b[i]*(1-f.a));
  const lum = (c) => { const f = v => { v/=255; return v<=0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  const ratio = (x,y) => { const [p,q] = [lum(x), lum(y)].sort((m,n)=>n-m); return (p+0.05)/(q+0.05); };

  // Effective background: walk up compositing every translucent layer onto the next.
  const bgOf = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c) { stack.push(c); if (c.a === 1) break; }
    }
    let base = [255,255,255];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };

  const root = document.querySelector(sel);
  const out = [];
  for (const el of root.querySelectorAll('*')) {
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!direct) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el);
    const px = parseFloat(cs.fontSize), w = +cs.fontWeight || 400;
    const large = px >= 24 || (px >= 18.66 && w >= 700);
    out.push({
      what: (el.className || el.tagName).toString().replace('token-tiers__',''),
      text: el.textContent.trim().slice(0, 22),
      px: Math.round(px), w, large,
      ratio: +ratio(over(fg, bg), bg).toFixed(2),
      need: large ? 3 : 4.5
    });
  }
  return out;
})`;

/**
 * The figures, and the states each can be put into.
 *
 * A state is a function rather than a selector because they are not all the same
 * kind of thing: one is a radio group where clicking a column resolves a brand,
 * the other a checkbox that strips the gates out of a ladder. What they share is
 * that the pair a reader sees does not exist until the click has happened.
 */
const FIGURES = [
  {
    root: '.token-tiers',
    states: [
      ['nothing picked', null],
      ['Expedia', '.token-tiers__brand[data-index="0"] .token-tiers__brand-name'],
      ['Hotels.com', '.token-tiers__brand[data-index="1"] .token-tiers__brand-name'],
      ['Vrbo', '.token-tiers__brand[data-index="2"] .token-tiers__brand-name']
    ]
  },
  {
    root: '.governance-tiers',
    states: [
      ['shipped ladder', null],
      ['rejected path', '.governance-tiers__toggle-label']
    ]
  }
];

let worst = { ratio: Infinity };
let failures = 0;

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/work/scaling-a-system/', { waitUntil: 'networkidle' });
  if (theme === 'dark') {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(250);
  }
  for (const { root, states } of FIGURES) {
    for (const [label, click] of states) {
      if (click) { await page.locator(click).click(); await page.waitForTimeout(500); }
      /* AUDIT is a source STRING, and page.evaluate ignores its argument list when
   handed one — the selector has to be baked into the expression instead. */
      const rows = await page.evaluate(`${AUDIT}(${JSON.stringify(root)})`);
      const fails = rows.filter((r) => r.ratio < r.need);
      const min = rows.reduce((m, r) => (r.ratio < m.ratio ? r : m));
      if (min.ratio < worst.ratio) worst = { ...min, theme, label };
      failures += fails.length;
      console.log(`${theme.padEnd(5)} ${root.replace('.', '').padEnd(17)} ${label.padEnd(15)} ` +
        `${String(rows.length).padStart(3)} text pairs, ${fails.length} below AA` +
        `  (lowest ${min.ratio}:1 — ${min.what} "${min.text}")`);
      for (const f of fails) {
        console.log(`        FAIL ${f.ratio}:1 need ${f.need}  ${f.px}px/${f.w}  ${f.what}  "${f.text}"`);
      }
    }
    // Back to the resting state before the next figure, so one figure's
    // selection cannot follow the other into its measurement.
    await page.reload({ waitUntil: 'networkidle' });
    if (theme === 'dark') {
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.waitForTimeout(250);
    }
  }
  await ctx.close();
}

console.log(`\n${failures} below AA across both figures, both themes, every state.`);
console.log(`worst pair ${worst.ratio}:1 — ${worst.what} "${worst.text}" (${worst.theme}, ${worst.label})`);
await browser.close();
if (failures) process.exit(1);
