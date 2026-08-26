#!/usr/bin/env node
/**
 * WCAG AA contrast, measured across every brand and both modes.
 *
 *   node design/verify-contrast.mjs
 *
 * Everything else in design/ asks whether a value came from a token. This asks
 * whether the resulting pair of values can actually be read, which is a
 * different question and the only one a reader has an opinion about. A palette
 * can be perfectly tokenised, checksummed and literal-free and still put grey
 * on white at 1.65:1 — which this repo has already shipped once, in fg/tertiary,
 * and found by eye months later.
 *
 * It resolves the semantic layer from tokens.json and each pack in
 * tokens/brands/, rather than from the generated CSS, so a brand is checked the
 * moment its pack exists. Alpha tokens are COMPOSITED over the background they
 * sit on, which is the whole reason this cannot be done by eye: fg/secondary in
 * dark mode is white at 70%, and what that resolves to depends entirely on the
 * band underneath it.
 *
 * The thresholds are WCAG 2.2: 4.5:1 for body text, 3:1 for large text and for
 * the boundary of a UI component (1.4.11). Disabled controls are exempt from
 * 1.4.3 and are reported rather than failed, because an exemption you cannot
 * see is one you stop thinking about.
 */
import { loadPacks, resolvePack } from '../tokens/brands.mjs';

/* ---------- colour ------------------------------------------------------- */

const hex = (h) => {
  const s = h.replace('#', '');
  const n = (i) => parseInt(s.slice(i, i + 2), 16);
  return s.length >= 8 ? [n(0), n(2), n(4), n(6) / 255] : [n(0), n(2), n(4), 1];
};

/** Composite a possibly-translucent colour over an opaque one. */
const over = (fg, bg) => {
  const [r, g, b, a] = fg;
  return [r * a + bg[0] * (1 - a), g * a + bg[1] * (1 - a), b * a + bg[2] * (1 - a), 1];
};

const luminance = ([r, g, b]) => {
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/* ---------- resolving a brand's semantic layer ---------------------------- */

/*
  Resolution comes from tokens/brands.mjs rather than being repeated here.

  An earlier version of this file carried its own merge-and-follow-aliases,
  which is the duplication design/component-specs.mjs and design/counts.mjs
  were both created to undo after the copies had already drifted. What is left
  below is the colour maths, which is genuinely this file's own job and lives
  nowhere else.
*/
const EMPTY = { primitive: {}, semantic: { light: {}, dark: {} } };
const modesFor = (pack) => resolvePack(pack ?? EMPTY);

/* ---------- the pairs that actually appear on the page -------------------- */

/** [foreground, background, threshold, what]. Backgrounds may be layered. */
const PAIRS = [
  ['fg.primary', ['band.base'], 4.5, 'body text on a base band'],
  ['fg.secondary', ['band.base'], 4.5, 'prose paragraphs on a base band'],
  ['fg.primary', ['band.sunken'], 4.5, 'body text on a sunken band'],
  ['fg.secondary', ['band.sunken'], 4.5, 'prose paragraphs on a sunken band'],
  ['fg.accent', ['band.base'], 4.5, 'accent text on a base band'],
  ['fg.link', ['band.base'], 4.5, 'links on a base band'],
  ['fg.link-hover', ['band.base'], 4.5, 'hovered links'],
  ['fg.link', ['band.sunken'], 4.5, 'links on a sunken band'],
  ['action.accent-fg', ['action.accent-bg'], 4.5, 'label on the accent button'],
  ['action.primary-fg', ['action.primary-bg'], 4.5, 'label on the primary button'],
  ['action.secondary-fg', ['band.base', 'action.secondary-bg'], 4.5, 'label on the secondary button'],
  ['fg.on-accent', ['action.accent-bg'], 4.5, 'text on an accent fill'],
  ['border.focus', ['band.base'], 3, 'focus ring (1.4.11)'],
  ['fg.inverse', ['bg.inverse'], 4.5, 'text on the inverse surface'],
  ['action.disabled-fg', ['action.disabled-bg'], 4.5, 'disabled label (exempt from 1.4.3)'],
  ['border.strong', ['band.base'], 3, 'placeholder outline (decorative)'],
  ['border.default', ['band.base'], 3, 'rules and dividers (decorative)']
];

/*
  Two tiers, because a threshold applied to the wrong thing is worse than no
  threshold: it gets "fixed" by moving a value that was correct.

  This check first failed border/strong at 1.65:1 in the BASE brand, which had
  shipped and been looked at for weeks. The reflex is to lighten the palette.
  The right move was to read the code: border/strong appears exactly once, as
  `1px dashed` on Media's "Image needed" placeholder, and border/default draws
  rules and dividers. WCAG 1.4.11 covers what is needed to IDENTIFY a control
  or understand content, so neither is in scope, and neither is text.

  They are still measured and still printed, for the same reason verify.mjs
  prints deprecated components and verify-provenance prints reconstructions:
  an accepted number that stops being visible quietly becomes an assumption.
*/
const EXEMPT = new Set([
  'disabled label (exempt from 1.4.3)',
  'placeholder outline (decorative)',
  'rules and dividers (decorative)'
]);

/* ---------- run ----------------------------------------------------------- */

/*
  One pack can serve several brands with identical values, so the list is
  flattened per brand rather than per file: a brand is what a reader is
  actually looking at, and reporting "portfolio.json passes" would hide which
  hostnames that covers.
*/
const brands = [
  ['deesyn (base)', null],
  ...loadPacks().flatMap(({ brands: bs, pack }) => bs.map((b) => [b, pack]))
];

const failures = [];
const notes = [];
let checked = 0;

for (const [name, pack] of brands) {
  const modes = modesFor(pack);
  const rows = [];
  for (const mode of ['light', 'dark']) {
    const tok = modes[mode];
    for (const [fgKey, bgKeys, min, what] of PAIRS) {
      const fg = hex(tok[fgKey] ?? '');
      if (!tok[fgKey]) throw new Error(`${name}/${mode}: no token ${fgKey}`);
      // Layer the backgrounds bottom-up so a translucent fill composites over
      // the band it is painted on rather than over nothing.
      let bg = null;
      for (const k of bgKeys) {
        if (!tok[k]) throw new Error(`${name}/${mode}: no token ${k}`);
        const c = hex(tok[k]);
        bg = bg === null ? (c[3] === 1 ? c : over(c, [255, 255, 255, 1])) : over(c, bg);
      }
      const r = ratio(over(fg, bg), bg);
      checked++;
      const ok = r >= min;
      rows.push([mode, what, r, min, ok]);
      if (!ok) (EXEMPT.has(what) ? notes : failures).push(`${name} / ${mode}: ${what} — ${r.toFixed(2)}:1, needs ${min}:1  (${fgKey} on ${bgKeys.join(' over ')})`);
    }
  }
  const worst = rows.filter((r) => !EXEMPT.has(r[1])).sort((a, b) => a[2] - b[2])[0];
  console.log(`\n  ${name}`);
  for (const mode of ['light', 'dark']) {
    const m = rows.filter((r) => r[0] === mode);
    const bad = m.filter((r) => !r[4] && !EXEMPT.has(r[1])).length;
    console.log(`    ${mode.padEnd(6)} ${m.length} pairs, ${bad ? `${bad} FAIL` : 'all pass'}`);
  }
  console.log(`    tightest  ${worst[2].toFixed(2)}:1  ${worst[1]} (${worst[0]})`);
}

if (notes.length) {
  console.log(`\n  measured, not gated — decorative or exempt under WCAG:`);
  notes.forEach((n) => console.log(`    ${n}`));
}

if (failures.length) {
  console.error(`\nWCAG AA: ${failures.length} pair${failures.length > 1 ? 's' : ''} below threshold\n`);
  failures.forEach((f) => console.error(`  ${f}`));
  console.error('');
  process.exit(1);
}

console.log(`\ncontrast: ${checked} pairs across ${brands.length} brands x 2 modes, all meet WCAG AA\n`);
