# The banding system

Full-width colour bands are revolut.com's core structural move. There is no nav chrome, no card grid, no shadow — the page is a vertical stack of edge-to-edge colour blocks, and the seam between two blocks *is* the divider.

This document is the spec for reproducing that. Values marked **measured** come from [`revolut-design-foundations.md`](./revolut-design-foundations.md); everything else is a decision made here.

## What a band is

A band is a full-viewport-width section with:

1. a **fill** (one of four roles),
2. a **foreground context** it imposes on everything inside it,
3. a **vertical scale** (how much air above and below),
4. a **measure** — content centred at 1000px, unless the content is declared full-bleed.

Nothing else. No border, no shadow, no rounded corner, no max-width on the fill itself.

## 1. The four band roles

Bands are **relative, not absolute**. This is the one thing to get right.

Revolut's site is light-only, so its bands can be literal hexes. Ours is [dual light/dark](../CLAUDE.md), so if bands hardcoded `#ffffff` / `#f7f7f7` / `#000000`, dark mode would either ignore the theme entirely or invert every band and destroy the alternation. Instead a band declares *what it is doing tonally* and the mode resolves it:

| Role | Light mode | Dark mode | What it's for |
|---|---|---|---|
| `base` | `#ffffff` | `#000000` | The default. Most bands. |
| `sunken` | `#f7f7f7` | `#1f1f1f` | The quiet alternate. One luminance step from `base` — a soft seam. |
| `inverse` | `#000000` | `#ffffff` | The flip. Punctuation, not rhythm. |
| `inverse-raised` | `#1f1f1f` | `#f7f7f7` | Only ever adjacent to `inverse` — a step *within* a dark passage. |

**In light mode this is Revolut, hex for hex** (`#ffffff` / `#f7f7f7` / `#000000` / `#1f1f1f` are all measured, and `#f7f7f7` is the most-used surface on the homepage at 6 large-surface hits). Dark mode preserves the same three-part structure — base, one-step shift, full flip — rather than the same colours.

### Four roles, two variables

The table has four rows but the implementation needs only two tokens, because **the bottom two rows are the top two under an inverted mode**:

| Role | Fill | Mode |
|---|---|---|
| `base` | `band/base` | inherited |
| `sunken` | `band/sunken` | inherited |
| `inverse` | `band/base` | **inverted** |
| `inverse-raised` | `band/sunken` | **inverted** |

Read the table above and it checks out in both directions: `band/base` inverted from Light gives `#000000`; `band/sunken` inverted gives `#1f1f1f` — which is exactly the measured black / elevated-dark pair. An inverse band is not a different colour. It is *the same band in the other theme*.

This is why `sunken` resolves to `#1f1f1f` in dark rather than `#111111`. `#1f1f1f` is the measured web "elevated dark" band; `#111111` only ever appears in RUI's app surface list, never as a web band. The collapse to two variables and the better-evidenced value are the same change.

Built as `band/base` and `band/sunken` in `02 Semantic`, both aliased (`Neutral/White`→`Neutral/Black`, `Neutral/20`→`Neutral/750`) — no new primitives, so rule 1 holds.

Note that the pre-existing `bg/inverse` is **not** the band black: it resolves to `#191c1f`, the app surface. Don't reach for it when you mean a band.

## 2. The band owns the foreground

**Rule: a band sets the foreground context; nothing inside it declares its own colour.** This is what makes an `inverse` band possible without forking every component.

Entering an `inverse` or `inverse-raised` band swaps the foreground set to the opposite mode's:

| | On `base` / `sunken` (light) | On `inverse` / `inverse-raised` (light) |
|---|---|---|
| `fg.primary` | `#191c1f` | `#ffffff` |
| `fg.secondary` | `#717173` | `white-70` |
| `fg.tertiary` | `#c9c9cd` | `white-50` |
| `border.subtle` | `black-4` | `white-6` |
| `border.default` | `#e2e2e7` | `white-14` |
| `fg.link` / `fg.accent` | `#0666eb` | `#6fa0ff` |
| `action.primary-bg` / `-fg` | `#191c1f` / `#ffffff` | `#ffffff` / `#191c1f` |
| `action.secondary-bg` | `black-4` | `white-6` |

In dark mode the two columns swap. Every value in that table is what the existing `02 Semantic` tokens already resolve to under a mode flip — none of it needed adding.

**Mechanism.** In CSS: one attribute on the section re-declares the semantic custom properties for its subtree. In Figma: `node.setExplicitVariableModeForCollection(semanticCollection, mode)` on the band frame — verified to cascade to grandchildren, so a component instance dropped into an inverse band flips with **zero overrides**.

One asymmetry to know about: **CSS redeclaration is relative, Figma's mode override is absolute.** `[data-band="inverse"]` means "the other mode, whatever the page is in"; Figma makes you name Light or Dark outright. So a Figma band authored inverse-in-a-light-page has to be re-pointed when the same layout is shown dark. The specimen page does this explicitly — the Light and Dark sequences carry opposite overrides on their inverse bands. It costs nothing in code; it's a Figma authoring tax.

**The accent swap is a contrast requirement, not taste.** `#0666eb` on `#000000` is **4.11:1** — passes AA for large text, fails for body and links. `#6fa0ff` on `#000000` is **8.15:1**. Note that `action.accent-bg` does *not* swap: white on `#0666eb` is 5.11:1 and passes on any band, so the blue button is identical everywhere.

## 3. Adjacency rules

1. **No two consecutive bands share a fill.** If content pushes two same-fill bands together, merge them into one band — don't stack the padding.
2. **Never two `inverse` bands in a row.** A second flip immediately after the first reads as a mistake, not emphasis. If two dark sections must adjoin, use `inverse` → `inverse-raised`: one dark passage with an internal step.
3. **`inverse-raised` may only touch `inverse`.** It is not a general fill; against `base` it's just muddy.
4. **`base` ⇄ `sunken` is the default rhythm.** `inverse` is punctuation — **at most two per page**, and never adjacent to each other (see 2).
5. **After an `inverse` band, return to `base`, not `sunken`.** Coming out of black into off-white wastes the contrast recovery.
6. **No borders, rules, or shadows on a band seam.** The colour step is the divider. (revolut.com has zero `box-shadow` on the entire homepage — **measured**.) The only permitted seam treatment is full-bleed imagery running to the band edge.
7. **Two adjacent bands never both take `feature`** (see §4). If they do, the page has no hierarchy — it's just long.

## 4. Vertical scale

Uses the existing `primitive.layout.*` scale. Padding is symmetrical top and bottom.

| Scale | `<768` | `768–1023` | `≥1024` | Use |
|---|---|---|---|---|
| `compact` | `l40` 40 | `l64` 64 | `l80` 80 | Logo rows, single-line statements, footers |
| `default` | `l64` 64 | `l96` 96 | `l128` 128 | Most bands |
| `feature` | `l80` 80 | `l128` 128 | `l200` 200 | The one or two bands carrying the argument |

**Hero is not a band scale.** The first band on a page is content-led with a min-height, not padding — it sets the page's tonal key and doesn't count toward the alternation.

Two adjacent bands never both take `feature` — rule 7.

## 5. Measure and bleed

Content measure is **1000px, measured** (25 `max-width` declarations on the live site; third-party claims of ~1200px are wrong). The fill is always 100% viewport width; only the content column is constrained.

| Viewport | Gutter | Effective measure |
|---|---|---|
| `<768` | 20 (`sp600`) | 100% − 40 |
| `768–1023` | 32 (`sp1000`) | 100% − 64 |
| `≥1024` | 40 (`l40`) | min(1000, 100% − 80) |

Gutters are a decision, not measured. **Heroes and photography run full-bleed past the measure — measured.** Anything full-bleed opts out of the content column explicitly; it is not the default.

## 6. Where this is built

Figma file **Revolut**, page **Banding**. Six sections:

| Section | What it is |
|---|---|
| `00 · The system` | This document, rendered on canvas. The role table's swatches are **live** — bound to `band/base` and `band/sunken` with explicit mode overrides, so "four roles, two variables" proves itself rather than being asserted. |
| `01 · Band — component set` | 12 variants, `role` (4) × `scale` (3). The variant schema is the API. |
| `02 · Legal sequence` | An 8-band page in Light and Dark, built from real instances. |
| `03 · Foreground inheritance` | The same button instance on `base` and `inverse`. Asserted at **0 overrides** on both. |
| `04 · Illegal adjacencies` | The five rule violations, each self-demonstrating. |
| `05 · Machine-readable spec` | The JSON below, rendered. |

**Machine-readable.** The whole spec is stored on the page as shared plugin data — any plugin or script can read it without parsing a document:

```js
figma.root.children
  .find(p => p.name === 'Banding')
  .getSharedPluginData('banding', 'spec');   // → JSON: roles, scales, rules, measure, breakpoints
```

Every individual band node also carries `getPluginData('band')` → `{role, scale}`, so a page built from bands can be **linted against the adjacency rules automatically** rather than by eye. That's the part Revolut doesn't have: they publish 378 CSS custom properties and no structure, and the structure is the hard bit to reverse-engineer.

**Nothing is hardcoded.** Audited across every node (191 at the time of writing, plus 85 text nodes in `00 · The system`): zero unbound fills, zero unbound strokes, zero raw padding values, zero unstyled text. Every colour is a `semantic` variable, every padding and gap a `Layout/*` or `Space/*` variable, every text a shared style. (Figma `SECTION` nodes carry an unbindable default fill — canvas chrome, not design content.)

`Demo / Button (stand-in)` exists only to prove foreground inheritance. The real button is a separate task and should replace it.

## 7. What's still open

The **rhythm** — which specific band is which role, in what order, on which page — is deliberately not specified here, because it's downstream of the three case studies. Two things it will decide:

- **Where the `inverse` bands land.** Rule 4 caps them at two per page. Which two is a content question: they should sit on the page's strongest claims.
- **Whether case-study pages take a different rhythm from the index.** A long case study with heavy imagery may need a `base`/`sunken` alternation with a single `inverse` for the outcome, rather than the index's shorter, punchier stack.

Everything in sections 1–5 is content-independent and can be built now.
