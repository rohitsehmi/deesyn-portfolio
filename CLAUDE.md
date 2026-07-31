# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A portfolio website showcasing a **maximum of three case studies**, for Rohit Sehmi's design work.

Started 2026-07-31. No site code exists yet — the work so far is design foundations in Figma.

## Decisions already made — do not re-litigate

| Decision | Choice | Note |
|---|---|---|
| Typeface (display) | **Hanken Grotesk** | Stand-in for Aeonik Pro, which is licensed (CoType Foundry) and not installed |
| Typeface (body/UI) | **Inter** | Mirrors Revolut's own Aeonik-marketing / Inter-product split |
| Brand match | **Near-exact Revolut match** | The risk of reading as derivative at senior level was raised and accepted. Settled. |
| Theming | **Dual light/dark from the start** | Via Figma variable modes |
| Accent | **Blue** — `#0666eb` light / `#6fa0ff` dark | Matches the *website*. Revolut's app accent `#ea035d` never renders on revolut.com |

## Source of truth for brand values

**`docs/revolut-design-foundations.md`** — verified against Revolut's live CSS, not eyeballed.

Rule: **measure the live site; don't trust secondhand design docs.** A third-party spec (getdesign.md) was checked against source and got the accent colour and max-width wrong, while correctly catching two things we'd missed. Details in that doc.

## Figma

File **"Revolut"** — `UnybX8G5sQIEhLLZN2YFl6`. Page **"Foundations — Revolut"** holds the built system. The original "Foundations" page (an Expedia EGDS template) is reference scaffolding only — not ours.

Connect via the **Figma Console MCP**: Figma desktop → Plugins → Development → **Figma Desktop Bridge** (manifest `~/.figma-console-mcp/plugin/manifest.json`). The plugin window must stay open.

`FIGMA_ACCESS_TOKEN` is **not configured**, so every REST-backed tool 403s — including `figma_get_file_data` and `figma_take_screenshot`. Use instead:
- `figma_execute` for all reads and writes (plugin sandbox)
- `figma_capture_screenshot` for visuals (plugin `exportAsync`, not REST)

### Plugin API gotchas that cost rebuild cycles

- `figma.currentPage = page` throws under `documentAccess: dynamic-page` — use `await figma.setCurrentPageAsync(page)`.
- **`resize()` flips BOTH axes to FIXED**, silently collapsing auto-layout frames to 1px. Correct order: `layoutSizingHorizontal='FIXED'` → `resize(w, h)` → `layoutSizingVertical='HUG'`.
- Wrapping frames need `primaryAxisSizingMode='FIXED'` *and* an explicit width, or they grow in one line instead of wrapping.
- Children of a `SECTION` use **section-relative** x/y, not absolute canvas coords.
- Always verify layout numerically or by screenshot after building — collapsed frames still report success.

## Repository

`https://github.com/rohitsehmi/revolut-case-studies` — **private**. Keep it private: `CLAUDE.md` and `docs/` state the ask context openly, and the repo reconstructs Revolut's design tokens under their name.

`memory` (symlink to `~/.claude/projects/…`) and `.claude/settings.local.json` are gitignored on purpose — the first would commit a broken absolute path, the second is machine-specific.

## Tokens

`tokens/tokens.json` — W3C DTCG format, 207 leaf tokens, exported from Figma and checksum-verified against it.

```bash
node tokens/build.mjs     # regenerate from tokens/figma-export.json
node tokens/verify.mjs    # checksum + alias integrity
```

**Components must reference `semantic.*`, never `primitive.*`** — that split is what makes re-theming a one-file change.

**Do not use the shadow tokens in site chrome.** revolut.com has zero `box-shadow`; depth is colour-banding and luminance. Shadows are for app mockups inside case studies only. See `tokens/README.md`.

## Current state

Built and visually verified on "Foundations — Revolut":

- **`01 Primitives`** — 113 variables (colour ramp, white/black alphas, `sp50–sp1000`, layout scale, radius, sizing, breakpoints)
- **`02 Semantic`** — 32 tokens × Light/Dark, every one aliased to a primitive, nothing hardcoded
- **23 text styles** — `Display/*`, `Heading/*`, `Lead/*`, `Body/*`, `Emphasis/*`, plus `UI/*` fenced off as product-only
- **6 effect styles** — kept for app mockups only; the website itself uses zero shadows
- **1 paint style** — `Gradient/Brand` (`#1227fd → #6fa0ff`)
- **4 specimen sections** — Colour (Light + Dark), Type, Space/Radius/Breakpoints, Elevation

## Next up

1. **The three case studies** — which three, and what each is *for*. Recommended first: components built before the content is known tend to get built twice.
2. **The banding system** — full-width `#000000` / `#ffffff` / `#f7f7f7` alternation is the site's core structural move. A layout pattern, not a token.
3. **Components** — button (48px pill), input (56px), nav (56px), card at r20, case-study tile, footer.
