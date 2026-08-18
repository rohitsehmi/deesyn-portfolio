#!/usr/bin/env node
/**
 * The page layout, measured out of the stylesheets that render it.
 *
 * WHY THIS EXISTS. Everything else the design system publishes is measured:
 * tokens off the Figma nodes, contracts off the bound variables, band roles off
 * the Banding page. The layout was the exception — band padding per breakpoint,
 * the measure, the type steps, the vertical rhythm — and it lived only in six
 * component stylesheets. Nothing stated it, so nothing could check it and
 * nobody could build from it.
 *
 * That gap has a cost with a date on it. On 2026-08-18 a full desktop mock of a
 * case study was built in Figma, and the band ROLES were right first time
 * because verify-bands publishes them, while SEVEN dimensions were wrong because
 * nothing does: the 768px tier of the responsive scale was used instead of the
 * 1024px one, `.measure`'s max-width was read as the content width when 40px of
 * inline padding comes out of it, and four type steps stopped one step short.
 * The mock looked plausible, which is why it survived being looked at.
 *
 * MEASURED, NOT AUTHORED, and that distinction is the whole value. This parses
 * the real CSS and resolves every `var(--primitive-*)` through the generated
 * tokens.css, so it cannot drift from what ships and it cannot flatter the
 * system. Change a padding and this changes; nobody gets to retype it.
 *
 * IT THROWS ON A MISSING VALUE rather than emitting a partial spec. A layout
 * export with a hole is worse than none: a hole reads as "this element has no
 * opinion" when it means "the parser lost it", and somebody builds to the gap.
 *
 *   node design/build-layout-export.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { TOKENS, TOKENS_CSS, LAYOUT_EXPORT } from './paths.mjs';

const root = new URL('../', import.meta.url).pathname;
const read = (p) => readFileSync(root + p, 'utf8');

/* ---------- resolve custom properties through the generated CSS ---------- */
const VARS = {};
for (const [, name, value] of read(TOKENS_CSS).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  VARS[name] = value.trim();
}
const px = (v) => {
  if (v == null) return null;
  const resolved = v.replace(/var\((--[\w-]+)\)/g, (_, n) => VARS[n] ?? '');
  const m = resolved.match(/(-?[\d.]+)px/);
  return m ? parseFloat(m[1]) : null;
};
/** `var(--type-display-s)` -> `display/s`, the Figma text-style name. */
const typeName = (v) => {
  const m = (v || '').match(/var\(--type-([\w-]+)\)/);
  if (!m) return null;
  const parts = m[1].split('-');
  // display-s -> display/s ; heading-l -> heading/l ; body-xl -> body/xl
  return parts[0] + '/' + parts.slice(1).join('-');
};
const chOf = (v) => {
  const m = (v || '').match(/([\d.]+)ch/);
  return m ? parseFloat(m[1]) : null;
};
/** `var(--semantic-fg-secondary)` -> `fg/secondary`, the Figma variable name. */
const colorName = (v) => {
  const m = (v || '').match(/var\(--semantic-([\w-]+)\)/);
  if (!m) return null;
  const parts = m[1].split('-');
  return parts[0] + '/' + parts.slice(1).join('-');
};

/* ---------- a CSS reader that knows which breakpoint a rule is in ---------- */
function regions(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let base = '', i = 0;
  while (i < css.length) {
    const at = css.indexOf('@media', i);
    if (at === -1) { base += css.slice(i); break; }
    base += css.slice(i, at);
    const open = css.indexOf('{', at);
    const cond = css.slice(at, open);
    let depth = 1, j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const m = cond.match(/min-width:\s*(\d+)px/);
    if (m) out.push({ min: +m[1], css: css.slice(open + 1, j - 1) });
    i = j;
  }
  out.unshift({ min: 0, css: base });
  return out.sort((a, b) => a.min - b.min);
}

function declsOf(regionCss) {
  const map = {};
  for (const [, sels, body] of regionCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const d = {};
    for (const part of body.split(';')) {
      const k = part.indexOf(':');
      if (k === -1) continue;
      d[part.slice(0, k).trim()] = part.slice(k + 1).trim();
    }
    for (const s of sels.split(',')) {
      const sel = s.trim().replace(/\s+/g, ' ');
      map[sel] = { ...(map[sel] || {}), ...d };
    }
  }
  return map;
}

/** Every breakpoint at which `selector`'s `prop` is declared, in order. */
function steps(css, selector, prop, cast) {
  const found = {};
  for (const r of regions(css)) {
    const v = declsOf(r.css)[selector]?.[prop];
    if (v !== undefined) found[r.min] = cast(v);
  }
  return Object.keys(found).length ? found : null;
}

const missing = [];
function need(label, value) {
  if (value === null || value === undefined) missing.push(label);
  return value;
}

/**
 * An element's type steps plus the colour it renders in.
 *
 * The title colour is declared once in the base region and never re-declared,
 * so it is read there; the font is read across every region because stepping is
 * the whole point. A selector that yields no font at all is a rename, and
 * `need` turns that into a refusal.
 */
function typeSpec(css, selector, label, colorSelector = selector) {
  const font = need(`${label} type`, steps(css, selector, 'font', typeName));
  // The size steps per breakpoint; the colour is declared once, and for the
  // section heading that is on the shared rule rather than the level variant.
  const color = need(`${label} colour`, colorName(declsOf(regions(css)[0].css)[colorSelector]?.color));
  return font ? { steps: font, color } : null;
}

/**
 * One element's rendered contract: what it steps to, what colour, what it caps
 * its measure at, and whichever box values were asked for.
 *
 * `px` values collapse to a number when they never change across breakpoints,
 * and stay a breakpoint map when they do — so a reader can tell at a glance
 * which values are responsive without comparing three identical numbers.
 */
function el(css, selector, label, opts = {}) {
  const base = declsOf(regions(css)[0].css)[selector] || {};
  const out = {};
  const font = steps(css, selector, 'font', typeName);
  if (font) out.type = font;
  const color = colorName(base.color);
  if (color) out.color = color;
  for (const [key, prop] of Object.entries(opts.px || {})) {
    const v = steps(css, selector, prop, px);
    if (v) out[key] = Object.keys(v).length === 1 ? Object.values(v)[0] : v;
  }
  for (const [key, prop] of Object.entries(opts.raw || {})) {
    // Name the token rather than leaking the custom property: `3px solid
    // fg/accent` is buildable in Figma, `var(--semantic-fg-accent)` is not.
    const v = steps(css, selector, prop, (x) =>
      x.replace(/var\(--semantic-([\w-]+)\)/g, (_, n) => {
        const parts = n.split('-');
        return parts[0] + '/' + parts.slice(1).join('-');
      }).trim()
    );
    if (v) out[key] = Object.keys(v).length === 1 ? Object.values(v)[0] : v;
  }
  const ch = chOf(base['max-width']);
  if (ch) out.maxWidthCh = ch;
  if (!Object.keys(out).length) missing.push(label);
  return out;
}

/* ---------- the stylesheets ---------- */
const bandCss = read('src/components/Band.css');
const baseCss = read('src/styles/base.css');
const shCss = read('src/components/SectionHeading.css');
const proseCss = read('src/components/Prose.css');
const contribCss = read('src/components/Contribution.css');
const hindCss = read('src/components/Hindsight.css');
const metricsCss = read('src/components/Metrics.css');
const explCss = read('src/components/Explorations.css');
// The case-study rhythm lives in a <style is:global> block in the layout.
const csCss = (read('src/layouts/CaseStudy.astro').match(/<style is:global>([\s\S]*?)<\/style>/) || [])[1] || '';

/**
 * The band sequence WITH its content, read off CaseStudy.astro's template.
 *
 * Bands do not nest, so a non-greedy match between each opening tag and its
 * close is exact. What lands inside is named by whichever it carries: a `slot`,
 * the hero markup, the next-study label, or the footer component.
 */
const csTemplate = read('src/layouts/CaseStudy.astro');
const tplBody = csTemplate.slice(csTemplate.indexOf('<Base'), csTemplate.indexOf('<style'));
const bands = [];
for (const [, attrs, body] of tplBody.matchAll(/<Band\b([^>]*)>([\s\S]*?)<\/Band>/g)) {
  const role = (attrs.match(/role=["{]([\w-]+)/) || [])[1] ?? null;
  const scale = (attrs.match(/scale=["{]([\w-]+)/) || [])[1] ?? null;
  const holds = [...body.matchAll(/<slot name="([\w-]+)"/g)].map((m) => m[1]);
  if (/class="cs-hero"/.test(body)) holds.unshift('hero');
  if (/cs-next__label/.test(body)) holds.push('next-study');
  if (/<Footer\b/.test(body)) holds.push('footer');
  bands.push({
    role: role === 'footerRole' ? 'base' : role,
    scale,
    holds,
    ...(role === 'footerRole'
      ? { note: 'role is computed from whether a band sits above it; base in practice' }
      : {})
  });
}
if (bands.length < 8) missing.push(`case-study band sequence (found ${bands.length}, expected 8)`);

const tokens = JSON.parse(read(TOKENS));
const breakpoints = Object.fromEntries(
  Object.entries(tokens.primitive.breakpoint).map(([k, v]) => [k, parseFloat(v.$value)])
);

/* ---------- the export ---------- */
const measureMax = need('.measure max-width', px(declsOf(regions(baseCss)[0].css)['.measure']?.['max-width']));
const measurePad = need('.measure padding-inline', steps(baseCss, '.measure', 'padding-inline', px));

const spec = {
  $description:
    'The page layout, parsed from the stylesheets that render it and resolved through tokens.css. ' +
    'Keys under a breakpoint map are min-widths in px; 0 is the base, no media query. ' +
    'Generated by design/build-layout-export.mjs — do not hand-edit.',

  breakpoints,

  /*
    WHICH SECTION SITS IN WHICH BAND, parsed from the layout that arranges them.

    verify-bands already checks the SEQUENCE of band roles, and a sequence is
    not an assignment: a Figma template was built on 2026-08-18 whose roles were
    the correct base/feature -> sunken/default -> ... -> base/compact and whose
    CONTENT was shifted one band along the whole way, so the inverse band showed
    the interface section instead of impact. Every band was legal and the page
    was wrong, which is precisely the failure a role-only check cannot see.

    Two things here that are easy to get wrong and are the reason it is parsed
    rather than described: the contribution list lives INSIDE the hero band
    rather than in one of its own, and the inverse band is IMPACT.
  */
  page: { caseStudy: bands },

  /* The single most misread value in the system: max-width INCLUDES the inline
     padding, so the content a designer draws to is narrower than 1000. */
  measure: {
    maxWidth: measureMax,
    paddingInline: measurePad,
    contentWidth: Object.fromEntries(
      Object.entries(measurePad).map(([bp, pad]) => [bp, measureMax - pad * 2])
    ),
    note: 'contentWidth = maxWidth - 2x paddingInline. At >=1024 the drawable column is 920, not 1000.'
  },

  band: {
    compact: need('band compact', steps(bandCss, ".band[data-scale='compact']", 'padding-block', px)),
    default: need('band default', steps(bandCss, ".band[data-scale='default']", 'padding-block', px)),
    feature: need('band feature', steps(bandCss, ".band[data-scale='feature']", 'padding-block', px))
  },

  /* Three steps, each a real one. See the comment in CaseStudy.astro. */
  rhythm: {
    paragraphToParagraph: need('prose gap', px(declsOf(regions(proseCss)[0].css)['.prose > * + *']?.['margin-block-start'])),
    headingToContent: need('section-heading margin', px(declsOf(regions(shCss)[0].css)['.section-heading']?.['margin-block-end'])),
    blockToBlock: need('cs-section gap', px(declsOf(regions(csCss)[0].css)['.cs-section.cs-section > * + *']?.['margin-block-start'])),
    headingInternal: need('section-heading gap', px(declsOf(regions(shCss)[0].css)['.section-heading']?.gap)),
    heroBlocks: need('cs-hero gap', px(declsOf(regions(csCss)[0].css)['.cs-hero']?.gap))
  },

  /* Responsive type STEPS between two styles on the scale. Never a clamp — every
     size rendered is a real Figma text style, which is what makes this buildable. */
  /* Each element's type STEPS and the colour it renders in. The colour belongs
     here because it is the other half of "build this element correctly", and
     because getting it wrong is invisible: fg/tertiary is 1.65:1 on white and a
     mock using it for body text still looks deliberate. */
  type: {
    caseStudyTitle: typeSpec(csCss, '.cs-hero__title', 'hero title'),
    caseStudyStandfirst: typeSpec(csCss, '.cs-hero__standfirst', 'hero standfirst'),
    sectionHeadingL2: typeSpec(shCss, ".section-heading[data-level='2'] .section-heading__title", 'section heading L2', '.section-heading__title'),
    sectionHeadingL3: typeSpec(shCss, ".section-heading[data-level='3'] .section-heading__title", 'section heading L3', '.section-heading__title'),
    sectionStandfirst: typeSpec(shCss, '.section-heading__standfirst', 'section standfirst'),
    prose: typeSpec(proseCss, '.prose p', 'prose paragraph'),
    proseLead: typeSpec(proseCss, ".prose[data-lead='true'] > p:first-child", 'prose lead paragraph')
  },

  /* Measured in `ch`, which Figma has no unit for. A Figma build must render the
     glyph run in the real text style and read the box — the value here is the
     count, not a width, and converting it is a per-style measurement. */
  /*
    THE BLOCKS INSIDE A SECTION, and this half exists because the first half was
    not enough. With the page chrome published, a Figma template still got
    Contribution, Hindsight and Metrics wrong — built from inference, because
    nothing stated their internals. Each was wrong in a way that looked
    deliberate: Contribution as a two-up grid rather than a labelled list with
    term and detail styles swapped, Hindsight as a plain heading and prose
    rather than the accent-ruled callout it is, Metrics without the top rule on
    each item and a step short on the value.

    These are code-only components. `components/specs/*` already publishes which
    token each CSS property references, which is the right answer to "is this
    hardcoded"; it is not the right answer to "what does this look like". This
    is that answer: structure, type, colour and measure in one place.
  */
  components: {
    contribution: {
      container: el(contribCss, '.contribution', 'contribution container', { px: { gap: 'gap' } }),
      row: el(contribCss, '.contribution__row', 'contribution row', {
        px: { gap: 'gap' }, raw: { columns: 'grid-template-columns', alignItems: 'align-items' }
      }),
      term: el(contribCss, '.contribution__term', 'contribution term'),
      detail: el(contribCss, '.contribution__detail', 'contribution detail')
    },
    hindsight: {
      /* An aside, set apart by surface and a single accent rule. Never a shadow. */
      container: el(hindCss, '.hindsight', 'hindsight container', {
        px: { gap: 'gap', padding: 'padding', radius: 'border-radius' },
        raw: { background: 'background', accentRule: 'border-inline-start' }
      }),
      title: el(hindCss, '.hindsight__title', 'hindsight title'),
      body: el(hindCss, '.hindsight__body p', 'hindsight body'),
      bodyGap: need('hindsight body gap', px(declsOf(regions(hindCss)[0].css)['.hindsight__body > * + *']?.['margin-block-start'])),
      note: 'Carries its own heading. Do not pair it with a SectionHeading saying the same thing.'
    },
    metrics: {
      container: el(metricsCss, '.metrics', 'metrics container', { px: { gap: 'gap' } }),
      grid: el(metricsCss, '.metrics__grid', 'metrics grid', {
        px: { gap: 'gap' }, raw: { columns: 'grid-template-columns' }
      }),
      item: el(metricsCss, '.metrics__item', 'metrics item', {
        px: { gap: 'gap', paddingBlockStart: 'padding-block-start' }, raw: { borderTop: 'border-top' }
      }),
      value: el(metricsCss, '.metrics__value', 'metrics value'),
      label: el(metricsCss, '.metrics__label', 'metrics label', { px: { gap: 'gap' } }),
      /* Inside `.metrics` at its 24 gap, NOT a peer block at 64 below it. */
      source: el(metricsCss, '.metrics__source', 'metrics source'),
      note: 'The source line is a child of .metrics, so it sits at the container gap.'
    },
    /* The hero carries the contribution list; there is no discipline tag on it. */
    hero: {
      container: el(csCss, '.cs-hero', 'hero container', { px: { gap: 'gap' } }),
      lede: el(csCss, '.cs-hero__lede', 'hero lede', { px: { gap: 'gap' } }),
      meta: el(csCss, '.cs-hero__meta', 'hero meta'),
      order: ['title', 'lede (standfirst + reading time)', 'contribution'],
      note: 'No tag or eyebrow. Reading time pairs with the standfirst inside the lede, not with the title.'
    },
    explorations: {
      container: el(explCss, '.explorations', 'explorations container', {
        px: { gap: 'gap' }, raw: { columns: 'grid-template-columns' }
      }),
      item: el(explCss, '.explorations__item', 'explorations item', { px: { gap: 'gap' } }),
      text: el(explCss, '.explorations__text', 'explorations text group', { px: { gap: 'gap' } }),
      title: el(explCss, '.explorations__title', 'explorations title'),
      why: el(explCss, '.explorations__why', 'explorations why'),
      note: 'Media sits above the text. layout=stack forces one column at every width.'
    }
  },

  measures: {
    caseStudyTitle: need('hero title ch', chOf(declsOf(regions(csCss)[0].css)['.cs-hero__title']?.['max-width'])),
    caseStudyStandfirst: need('hero standfirst ch', chOf(declsOf(regions(csCss)[0].css)['.cs-hero__standfirst']?.['max-width'])),
    sectionStandfirst: need('section standfirst ch', chOf(declsOf(regions(shCss)[0].css)['.section-heading__standfirst']?.['max-width'])),
    proseDefault: need('prose default ch', chOf(declsOf(regions(proseCss)[0].css)[".prose[data-measure='default']"]?.['max-width'])),
    proseNarrow: need('prose narrow ch', chOf(declsOf(regions(proseCss)[0].css)[".prose[data-measure='narrow']"]?.['max-width'])),
    unit: 'ch'
  }
};

if (missing.length) {
  console.error('\nlayout export — could not measure:');
  missing.forEach((m) => console.error(`  ${m}`));
  console.error('\nA selector was renamed or a declaration moved. Fix the parser rather than');
  console.error('hand-writing the value, or the export stops being measured.\n');
  process.exit(1);
}

writeFileSync(root + LAYOUT_EXPORT, JSON.stringify(spec, null, 2) + '\n');

const bp = (o) => Object.entries(o).map(([k, v]) => `${k}:${v}`).join('  ');
console.log(`\n${LAYOUT_EXPORT}`);
console.log(`  breakpoints   ${bp(breakpoints)}`);
console.log(`  measure       max ${spec.measure.maxWidth}  content ${bp(spec.measure.contentWidth)}`);
console.log(`  band feature  ${bp(spec.band.feature)}`);
console.log(`  band default  ${bp(spec.band.default)}`);
console.log(`  band compact  ${bp(spec.band.compact)}`);
console.log(`  rhythm        para ${spec.rhythm.paragraphToParagraph}  heading ${spec.rhythm.headingToContent}  block ${spec.rhythm.blockToBlock}`);
console.log(`  type steps    ${Object.keys(spec.type).length} elements`);
console.log(`  ch measures   ${Object.keys(spec.measures).length - 1}\n`);