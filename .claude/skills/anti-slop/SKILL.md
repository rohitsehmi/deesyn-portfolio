---
name: anti-slop
description: Layout, content, and copy discipline for the portfolio site. Catches the patterns that make a page read as AI-generated — eyebrows on every section, fake div screenshots, scroll cues, decorative dots, section-number labels, hairline spec tables, filler copy. Use when building or reviewing any page, section, or component, and as a pre-ship check before declaring a surface done. Covers layout families, content density, CTA and form discipline, image strategy, and copy self-audit. Does not cover motion — see emil-design-eng.
---

# Anti-Slop

Adapted from the `design-taste-frontend` skill, trimmed to what applies here. Sections that would have contradicted decisions already settled on this project have been removed rather than softened.

## What this skill does NOT decide

These are settled. Do not re-open them, and ignore any general advice that contradicts them:

| Settled | Where |
|---|---|
| **Near-exact Revolut brand match.** The site is deliberately derivative. Any "would someone guess the aesthetic from the category?" test does not apply. | `CLAUDE.md` |
| **Inter for body/UI, Hanken Grotesk for display.** Chosen because Revolut uses Inter, verified against live CSS. Generic advice to avoid Inter does not apply. | `docs/revolut-design-foundations.md` |
| **Bands invert.** `inverse` and `inverse-raised` are two of four band roles, capped at two per page. Generic "one theme per page, sections never invert" rules do not apply. | `docs/banding-system.md` |
| **Colour, space, radius, type.** All tokenised. A rule here that names a specific colour or size loses to the token. | `tokens/tokens.json` |
| **No shadows in site chrome.** Depth is colour-banding and luminance. Shadows are for app mockups inside case studies only. | `tokens/README.md` |
| **Every value binds to `semantic.*`.** A hardcoded hex is a build failure. | `CLAUDE.md` |

Motion is out of scope here. See `emil-design-eng`.

---

## 1. Layout discipline

Failing any of these is shipping broken work.

- **Hero fits the initial viewport.** Headline max 2 lines at desktop, subtext max 20 words and max 4 lines, CTA visible without scrolling. If the copy is too long, cut the copy or reduce the scale. A 4-line hero headline is a font-size error, not a copy-length error.
- **Hero top padding caps at ~6rem desktop.** More and the content floats halfway down the viewport and reads as a layout bug.
- **Hero stack: max 4 text elements.** Eyebrow OR brand strip (or neither), headline, subtext, CTAs. Banned in the hero: tiny tagline below the CTAs, trust micro-strip, pricing teaser, feature bullets, avatar row. Those go in their own section below.
- **Nav renders on one line at desktop**, height 80px max, 56-72px preferred. A two-line desktop nav is broken.
- **Section-layout-repetition ban.** Once a layout family is used for a section, it appears at most once. Eight sections need at least four different families.
- **Zigzag cap.** Max 2 consecutive image+text split sections. The third is a fail. Break with a full-width section, a vertical stack, a grid, or a different family.
- **Eyebrow restraint.** An eyebrow is the small uppercase wide-tracking label above a section headline. Maximum **1 per 3 sections**; hero counts as 1. If section A has one, the next two cannot. The mechanical check: count `uppercase tracking` micro-labels across all components; fail if the count exceeds `ceil(sectionCount / 3)`. Usually the right move is to drop it entirely — the headline alone is enough, and the section's position on the page already categorises it.
- **Split-header ban.** "Left big headline + right small explainer paragraph" as a section header is banned as a default. Stack them vertically instead. Reach for the split only when the right column carries a real visual or interactive element, not filler text.
- **Grid cell count is exact.** N items means N cells. An empty cell in the middle or at the end means the grid was planned wrong. Re-shape it; never paste a blank tile.
- **Mobile collapse is explicit per section.** For every multi-column layout, declare the sub-768px fallback in the same component. No "it'll work" assumptions.
- **Cards are the lazy answer.** Use them only when elevation or grouping communicates real hierarchy. Otherwise group with a rule, a divider, or negative space. Nested cards are always wrong.
- **No text overflow.** Long heading words plus a large clamp plus a narrow grid causes overflow at tablet and mobile. Test the real copy at every breakpoint.

## 2. Content density

The page lives on the first impression, not the full read. Cut ruthlessly.

- **Default per section:** headline of 8 words or fewer, sub-paragraph of 25 words or fewer, plus one visual OR one CTA. Anything more is justified by the section's job.
- **No data-dump sections.** A 20-row table, a 30-item award list, a giant matrix means the wrong layout. Use top 3-5 highlights plus a link, a carousel for breadth, or a separate page if the data is the product.
- **Long lists need a different component, not a longer list.** Past 5 items, a default `<ul>` with `divide-y` is the lazy choice. Reach for: a 2-column split with grouped items, a card grid, tabs or an accordion if items are categorisable, horizontal scroll-snap pills, or a carousel.
- **Spec tables with a hairline under every row are banned.** Group into 2-3 logical clusters with sparse dividers, or move to a card-per-spec layout, or show 3-4 hero specs as display tiles with the rest behind a disclosure.
- **Fake-precise numbers are flagged.** `92%`, `4.1x`, `48k`, `5.8mm` either come from real data, are explicitly labelled as mock, or are cut. Do not fake precision the work does not claim. On a portfolio this matters more than usual: invented metrics in a case study are a credibility failure, not a design one.
- **One copy register per page.** Don't mix technical mono, editorial prose, and marketing punch in the same composition.

## 3. CTAs, forms, and interactive states

- **Button contrast (a11y, mandatory).** Verify every CTA's label against its own background. White-on-white, transparent-over-page-with-no-border, ghost buttons over photography with no scrim — all banned. WCAG AA: 4.5:1 body, 3:1 for large text 18px+.
- **CTA labels do not wrap.** Button text fits on one line at desktop. Fix by shortening the label (3 words max, ideally 1-2) or widening the button. A wrapped desktop CTA is a fail.
- **No duplicate CTA intent.** "Get in touch" + "Let's talk" + "Start a project" are one intent. Pick one label and use it in the nav, the body, and the footer. Same for "View work" / "See selected work" / "Browse projects".
- **Button labels are verb + object.** "Read the case study" beats "Learn more". The label says what will happen.
- **Link text stands alone.** Screen readers announce links out of context. "View the Monzo case study" beats "Click here".
- **Form fields:** label above the input, error text below it, helper text present in markup. Never placeholder-as-label. Placeholders, focus rings, helper text, and error text all pass AA against the section background.
- **Ship the full state cycle.** Loading (skeletons matching the final shape, not generic spinners), empty (composed, indicates how to populate), error (inline for forms, contextual for transient).

## 4. Images and visual assets

A portfolio is a visual product. A text-only page with fake screenshot divs is incomplete work, not minimalism.

Priority order:

1. **Image generation tool**, if one is available in the environment. Generate section-specific assets at the right aspect ratio.
2. **Real photography or real screenshots.** For placeholders, `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` with a seed that names the section.
3. **Clearly-labelled placeholder slots** (`<!-- TODO: hero, 1600x1200 -->`), and say at the end which placements need real images.

Hard bans:

- **Div-based fake screenshots.** Fake dashboards, fake task lists, fake terminals built from styled `<div>`s are the single biggest tell. Use a real screenshot, a real mini-version of the actual UI, or nothing. On this project the case-study app mockups are real work — show the real thing.
- **Hand-rolled decorative SVG.** Custom illustrations, doodles, sketchy paths, `feTurbulence` grain filters. Icons from a library are fine; drawing icon paths from scratch is not.
- **One icon family per project**, with a single global stroke width.
- **No pills, tags, or labels overlaid on images** (`Brand · 02`, `Field notes`). Let the image speak, or caption directly below it, outside the image.
- **No decorative photo credits.** `Field study no. 12 · Ines Caetano`, `Frame XII · 35mm`. Credit is for a real photographer who took a real photo. Otherwise skip it or use one functional line.

## 5. Production tells (hard bans)

These are the signatures a page picks up when it is trying to look designed. Each is banned unless a reader explicitly calls for it.

**Top of page**
- No version labels in the hero: `V0.6`, `BETA`, `EARLY ACCESS`, `INVITE-ONLY PREVIEW`.
- No `Brand · No. 01` sub-eyebrows or micro-meta lines.
- No decoration text strip at the hero bottom: `BRAND. MOTION. SPATIAL.`, `DESIGN · BUILD · SHIP`, `ESTD. 2018 · LONDON`. Only acceptable if the strip carries real navigable links or real status.

**Section labels and numbering**
- No section-number eyebrows: `00 / INDEX`, `001 · Capabilities`, `06 · how it works`. Eyebrows name the topic in plain language or don't exist. Numbers earn their place only when the section genuinely *is* an ordered sequence and the order carries information.
- No `01 / 4` pagination on images or tiles. If the user can count, they don't need the label.
- No range labels as eyebrows: `Index of Work, 2018 - 2026`.
- No micro-meta-sentences under a heading ("Each of these is something we ship today, not a roadmap promise."). Eyebrow, headline, body is enough.
- No generic step labels: `Stage 1 / Stage 2`, `Phase 01 / Phase 02`. The step content is the label — "Research", "Prototype", "Ship".
- No floating top-right sub-text in section headings. Either put it under the headline or build a properly aligned 2-column header.

**Separators and decoration**
- **The middle dot (`·`) is rationed.** Max 1 per line in a metadata strip. Never the default separator for everything.
- **Zero decorative status dots by default.** A coloured dot before every nav item, list row, or badge is a tell. Only for real semantic state, and sparingly.
- No crosshair or hairline grid lines drawn purely to make the page feel designed. Only when they organise real content.
- No `border-t` + `border-b` on every row of a list. Pick one, use it sparsely.
- No scoring or progress bars with filled background tracks as comparison visuals.
- No neon or outer glows. Depth here is banding, not glow.
- **No gradient text** (`background-clip: text` over a gradient). Emphasis comes from weight, size, or colour. Note: the `Gradient/Brand` paint style is for surfaces and fills, not type.

**Copy tells**
- No "Quietly in use at" / "Quietly trusted by".
- No poetic section labels: "From the field", "Field notes", "Currently on the bench", "On our desks", "Loose plates". Use plain functional labels or none.
- No mock-humble industry asides ("We respect the French ones").
- No locale, time, or weather strips: `London 14:23 · 11°C`, an atmospheric city line in the hero or footer. A contact address in the footer is fine; atmosphere is not.
- No scroll cues: `Scroll`, `↓ scroll`, `Scroll to explore`, animated mouse-wheel icons. If the user hasn't scrolled, they're looking at the hero. They know what scroll is.
- No version footers on a marketing page: `v1.4.2`, `Build 0048`, `last sync 4s ago · main`.
- No live-stock counters as decoration: "Reservation 412 of 800".
- No `<br>`-broken-and-italicised headlines as a default design move.
- No vertical rotated text. Agency-portfolio cliché.
- No filler verbs: elevate, seamless, unleash, supercharge, streamline, leverage, next-gen, world-class, game-changer, mission-critical, revolutionize. Pick a specific noun and a verb that says what the thing literally does.

**Placeholder content**
- No generic names: John Doe, Sarah Chan, Jane Smith. Use realistic, locale-appropriate names.
- No generic avatars: SVG eggs, default user icons.
- No fake-perfect numbers: `99.99%`, `50%`, `1234567`. Real data is messy.
- No startup-slop brand names: Acme, Nexus, SmartFlow, Cloudly.

**Quotes and testimonials**
- Max 3 lines of quote body. Cut the original if needed; a page quote is a snippet, not the full review.
- Attribution is name + role + optionally company. Never a name alone.
- Real typographic quotes (" ") or none. Not straight ASCII.

## 6. The em-dash ban

**Zero em-dashes (`—`) in anything rendered on the page.** Headlines, eyebrows, labels, pills, button text, body copy, quotes, attribution, captions, alt text, nav items. There is no "sparingly" allowance; this is the single most-violated rule and the clearest tell.

Replace with: a period, a comma, a colon, parentheses, a line break, or restructuring into two sentences.

En-dash (`–`) as a separator is banned too. Ranges use a hyphen: `2018-2026`, `£40-80k`.

The only permitted dash characters in page copy are the regular hyphen `-` and a minus sign in maths.

**Scope:** this rule governs *rendered page copy*. Markdown docs, commit messages, and code comments in this repo are exempt.

## 7. Copy self-audit (before ship)

Re-read every visible string: headlines, subheads, labels, button text, body copy, captions, alt text, footer, error messages. Flag and rewrite anything that is:

- **Grammatically broken**, or has an unclear referent ("we plan to stay that way" with no prior context).
- **Cute-but-wrong wordplay** or a forced metaphor that doesn't track.
- **Aphoristic cadence used as a default voice.** If several sections share one repeating sentence rhythm, especially a contrarian-sounding closer, rewrite. Specific, not aphoristic.
- **Restating the heading.** No intro paragraph that repeats the title.

If you're unsure whether a string works, replace it with a plain functional sentence. Boring copy beats AI-cute copy.

## 8. Accessibility and performance

Motion accessibility lives in `emil-design-eng`. This covers the rest.

- **Contrast:** body text 4.5:1 minimum against its background, large text (18px+, or bold 14px+) 3:1. Placeholder text needs the full 4.5:1, not a muted-grey default. The most common failure is muted grey on a tinted near-white. If it's close, move toward the ink end of the ramp.
- **Grey text on a colour** looks washed out. Use a darker shade of the background's own hue, or a transparency of the text colour.
- **Both modes tested.** Do not ship a surface you have only seen in one mode, and verify anything inside an `inverse` band resolves with zero overrides.
- **Line length** caps at 65-75ch for body copy.
- **Type hierarchy** through scale and weight contrast, at least a 1.25 ratio between steps. Avoid flat scales.
- `text-wrap: balance` on h1-h3, `text-wrap: pretty` on long prose.
- **Semantic z-index scale** (dropdown, sticky, modal-backdrop, modal, toast, tooltip). Never `999` or `9999`.
- **Viewport stability:** `min-h-[100dvh]`, never `h-screen`. iOS Safari's address bar causes a jump.
- **Dropdowns inside `overflow: hidden`/`auto` get clipped.** Use the popover API, `position: fixed`, or a portal.
- **Core Web Vitals:** LCP under 2.5s (hero image preloaded or priority), INP under 200ms, CLS under 0.1 (reserve space for images, fonts, embeds).
- **Grain and noise filters** go on a fixed, `pointer-events-none` pseudo-element only. Never on a scrolling container.

## 9. Pre-ship check

Run every box. If one cannot be honestly ticked, the surface is not done.

- [ ] Zero em-dashes anywhere rendered on the page
- [ ] Eyebrow count ≤ `ceil(sectionCount / 3)`, hero counted
- [ ] No section-number eyebrows, no `01 / 4` pagination, no range labels
- [ ] No scroll cues, no locale/time strips, no version footers, no decorative dots
- [ ] No split-header pattern, no floating top-right sub-text
- [ ] No 3+ consecutive image+text splits; at least 4 layout families across 8 sections
- [ ] No div-based fake screenshots, no hand-rolled decorative SVG
- [ ] No labels overlaid on images, no decorative photo credits
- [ ] Grid cell count matches item count exactly
- [ ] Hero fits the viewport: 2-line headline max, 20-word subtext max, CTA visible
- [ ] Hero has 4 text elements at most
- [ ] Nav is one line at desktop, 80px tall at most
- [ ] Every CTA label fits one line and passes AA contrast against its own background
- [ ] No two CTAs share an intent
- [ ] Form labels, placeholders, focus rings, helper and error text all pass AA
- [ ] Lists past 5 items use a real component, not `divide-y` rows
- [ ] Every number is real, or labelled as mock
- [ ] Copy self-audit done; no filler verbs, no aphoristic cadence, no restated headings
- [ ] Body text at least 4.5:1, line length 65-75ch
- [ ] Mobile collapse declared explicitly for every multi-column layout
- [ ] Verified in both modes, and inside an `inverse` band with zero overrides
- [ ] Every fill, padding, gap, and text style bound to a token; zero hardcoded hex
