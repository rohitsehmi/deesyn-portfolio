# Design tokens

Revolut-matched tokens for the case-study portfolio, exported from Figma file `UnybX8G5sQIEhLLZN2YFl6` (page **Foundations — Revolut**).

Values are verified against revolut.com's live CSS — not eyedropped. See [`../docs/revolut-design-foundations.md`](../docs/revolut-design-foundations.md) for the evidence behind each one.

## Files

| File | Role |
|---|---|
| `figma-export.json` | Raw compact export from Figma. **Source of truth.** |
| `build.mjs` | Expands the export into `tokens.json` |
| `tokens.json` | **The deliverable** — W3C Design Tokens format |
| `verify.mjs` | Checksums the export against Figma; checks alias integrity |

```bash
node tokens/build.mjs     # regenerate tokens.json
node tokens/verify.mjs    # checksum + integrity check
```

## What's in `tokens.json`

207 leaf tokens, 64 alias references, all resolving.

```
primitive/        113   raw values — never reference these from components
  brand           5     accent, accent-deep, action-blue, blue-deep, blue-light
  neutral         14    black → white
  accent          17    the wider RUI hue set
  alpha           14    white/black alphas — the dark-mode layering technique
  status          4
  premium, metal  5
  space           10    sp50–sp1000 (2–32px), product rhythm
  layout          8     l40–l200, marketing rhythm
  radius          11    r2–r36 + round
  size            19    controls, nav, max-width
  breakpoint      4     425 / 768 / 1024 / 1440

semantic/         32 × 2 modes   ← reference THESE
  light/ dark/    bg · fg · border · action · status

typography/       23    display · heading · lead · body · emphasis · ui
shadow/           6     app mockups only — the site itself uses none
gradient/         1     brand (#1227fd → #6fa0ff)
```

## Two rules

**1. Components reference `semantic`, never `primitive`.** The whole point of the two-layer split is that re-theming touches one file. A component that reaches for `primitive.brand.action-blue` breaks that.

**2. Don't use the shadows in site chrome.** A full scan of revolut.com found **zero** `box-shadow`. Depth comes from full-width colour bands (`#000000` / `#ffffff` / `#f7f7f7` / `#1f1f1f`) and luminance shifts. The shadow tokens exist for app-UI mockups *inside* case studies, and are black-alpha only so they do nothing on dark surfaces anyway.

## Consuming these

The format is [W3C DTCG](https://tr.designtokens.org/format/), so [Style Dictionary](https://styledictionary.com) v4+ reads it directly and can emit CSS custom properties, Tailwind theme config, TS constants, or iOS/Android output.

Light/dark are separate token groups (`semantic.light` / `semantic.dark`) rather than a mode axis, because DTCG has no first-class mode concept yet. For CSS, emit `semantic.light` at `:root` and `semantic.dark` under `@media (prefers-color-scheme: dark)` plus a `[data-theme="dark"]` override.

## Typography notes

- `lineHeight` is a **unitless multiplier**; `letterSpacing` is in **em**.
- Display tracking is calibrated to measured px values from revolut.com at 1512px — it is *not* a smooth curve, because Revolut sets tracking in fixed px so the ratio drifts by size.
- Body is Inter **400** with *positive* tracking below 14px. This is the marketing weight. `ui.*` carries the heavier product weights (RUI uses 500/700/800) and should only appear inside app mockups.
- `Hanken Grotesk` stands in for Aeonik Pro, which is licensed. If Aeonik is ever bought, swapping `fontFamily` in `figma-export.json` and rebuilding is the only change needed.
