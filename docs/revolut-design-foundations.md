# Revolut Design Foundations — verified reference

Every value below was read from Revolut's live CSS on 2026-07-31, not eyedropped from screenshots. Method: `getComputedStyle` plus stylesheet traversal across all 956 CSS rules and every rendered element at a 1512px viewport.

## The one thing to understand first

**RUI product tokens ≠ what the marketing site renders.**

Revolut exposes their production design system ("RUI") as ~378 CSS custom properties on revolut.com. Several are *defined but never applied*. Always verify usage, not just definition.

## Colour

The marketing site is **essentially achromatic** — full-width bands with photography carrying all the colour.

| Role | Value | Evidence |
|---|---|---|
| Band — black | `#000000` | 3 large-surface uses |
| Band — white | `#ffffff` | 3 |
| Band — off-white | `#f7f7f7` | 6 (most common) |
| Band — elevated dark | `#1f1f1f` | 2 |
| Accent — action blue | `#0666eb` | 4 CSS hits |
| Accent — light blue | `#6fa0ff` | 4 |
| Gradient start | `#1227fd` | 4 |

### Two colours people get wrong

- **`#ea035d`** (RUI `--rui-color-accent`, the pink) appears **once** — its own definition. Never applied on the homepage. It's an app token, not the web accent.
- **`#494fdf`** "cobalt violet" — **zero occurrences** in any stylesheet. Not a Revolut colour, despite third-party docs naming it the primary accent.

### Greyscale in dark mode

Expressed as **white alphas**, not solid greys — this layering is what gives the UI depth:
`0.06 · 0.10 · 0.14 · 0.24 · 0.50 · 0.70 · 0.85`

Other RUI surfaces (app, not web): `#111111`, `#191c1f`, `#1c1c1e`, `#272b2f`, `#414549`.

## Typography

**Aeonik Pro weight 500** for display — notably *not* bold. **Inter** for body and UI.

Marketing body is Inter **400** (RUI's product body token says 500 — that's the app), with **positive** tracking below 14px.

### Measured tracking curve

Letter-spacing is set in fixed px, so the percentage varies by size:

| Size | Tracking | As % |
|---|---|---|
| 88.9px (hero) | −2.08px | −2.36% |
| 52.4px (section head) | −0.60px | −1.15% |
| 24px | −0.24px | −1.00% |
| 16px | 0 | 0% |
| 12px (body) | +0.18px | +1.50% |

Display line-height is **1.0**. Aeonik also appears at 16px/500 and 18px/400 — it is not display-only.

## Layout

- **Content measure: 1000px.** Confirmed by 25 `max-width` declarations. Third-party claims of ~1200px are wrong.
- Heroes and photography run **full-bleed** past the measure.
- Nav height **56px**.
- Breakpoints: **425 / 768 / 1024 / 1440**.

## Spacing

RUI's web spacing tokens are **misleading** — `--rui-space-s12` resolves to **8px**, not 12. The honest primitives:

```
sp50=2  sp100=3  sp150=4  sp200=6  sp300=8
sp400=12  sp500=16  sp600=20  sp800=24  sp1000=32
```

`--rui-size-s*` *does* map literally (s12=12px, s16=16px …).

Marketing needs larger steps than the product scale covers — we added `40 · 48 · 64 · 80 · 96 · 128 · 160 · 200`.

## Radius

In use on the site: `9999px` (49×), `12px` (46×), `50px`, `20px` (6×), `24px`.

Full scale carried: `2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 36 · round`.

Buttons are full pills. Cards are 20px.

## Elevation

**Zero `box-shadow` on the entire homepage.** Depth comes from colour-banding and luminance shifts, never elevation.

RUI *does* define shadow tokens, but they are black-alpha only — so they also do nothing on dark surfaces. Keep them for app-UI mockups inside case studies; do not use them in site chrome.

## Motion

Durations `100 · 200 · 300 · 450 · 900ms` on `cubic-bezier(0.15, 0.5, 0.5, 1)`.

## Sizing

Buttons `28 / 32 / 44` (RUI product) and **48px** minimum on marketing. Inputs **56px**.

---

## On secondhand specs

This reference exists because a third-party spec — getdesign.md's Revolut DESIGN.md — was compared against source. The scorecard:

**It was right about behaviour** (and improved our system): body is Inter 400 not 500; small text takes positive tracking; the site uses no shadows at all; 20px radius exists; breakpoints were missing entirely.

**It was wrong about values**: `#494fdf` as primary accent (zero occurrences); ~1200px measure (it's 1000px); a 136px hero (measured 88.9px at 1512px).

That page describes itself as "independent analysis of publicly observable patterns." Careful eyeballing gets *behaviour* right and *hex values* wrong, which is exactly the pattern above.

**Rule: measure the live site. Treat every secondhand doc — including this one — as a hypothesis to verify.**
