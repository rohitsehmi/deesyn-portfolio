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

`tokens/tokens.json` — W3C DTCG format, 246 leaf tokens, exported from Figma and checksum-verified against it (`4115829316`, matched 2026-08-03).

```bash
node tokens/build.mjs     # regenerate from tokens/figma-export.json
node tokens/verify.mjs    # checksum + alias integrity
```

The Figma-side export snippet lives in `tokens/figma-export.snippet.js` and returns the same checksum. **Don't rewrite it from memory** — it maps Figma's font *style name* to a numeric weight, and dropping that silently rewrites all 23 typography tokens.

**Components must reference `semantic.*`, never `primitive.*`** — that split is what makes re-theming a one-file change.

**Do not use the shadow tokens in site chrome.** revolut.com has zero `box-shadow`; depth is colour-banding and luminance. Shadows are for app mockups inside case studies only. See `tokens/README.md`.

## Current state

Built and visually verified on "Foundations — Revolut":

- **`01 Primitives`** — 122 variables (colour ramp, white/black alphas, `sp50–sp1000`, layout scale, radius, sizing, breakpoints, `Duration/*`, `Easing/*`)
- **`02 Semantic`** — 47 tokens × Light/Dark, every one aliased to a primitive, nothing hardcoded
- **23 text styles** — `Display/*`, `Heading/*`, `Lead/*`, `Body/*`, `Emphasis/*`, plus `UI/*` fenced off as product-only
- **6 effect styles** — kept for app mockups only; the website itself uses zero shadows
- **1 paint style** — `Gradient/Brand` (`#1227fd → #6fa0ff`)
- **5 specimen sections** — Colour (Light + Dark), Type, Space/Radius/Breakpoints, Elevation, Motion

## Motion

`05 · Motion` on the Foundations page: four plotted easing curves, the duration scale as proportional bars, and the frequency gate that decides whether a thing animates at all.

`duration.*` and `easing.*` are **mode-independent** — both modes alias the same primitive — but they live in the semantic layer so components never reach past `semantic`. Figma has no duration or cubicBezier variable type, so primitives are a `FLOAT` of milliseconds and a `STRING` of CSS easing; `build.mjs` expands them to DTCG `duration` and `cubicBezier`.

**Never `ease-in` on UI, and never animate a keyboard-initiated action.** Full rules in `tokens/README.md` and `.claude/skills/emil-design-eng/SKILL.md`.

Machine-readable, same pattern as banding: `page.getSharedPluginData('motion', 'spec')` returns the whole rule set, and each specimen node carries `getPluginData('motion-token')`.

## Components

Figma page **Components**. Naming groups by purpose: `Layout/*`, `Action/*`, `Chrome/*`, `Content/*`, `Brand/*`, plus top-level `Icon`. Variant props are **lowercase** (`variant=primary, size=lg`), booleans kebab-case, slot names lowercase nouns.

Built — **55 variants across 8 sets**: `Icon` (8), `Brand/Logo` (2), `Action/Button` (27), `Action/Link` (2), `Action/Arrow Link` (2), `Content/Tag` (2), `Content/Media` (8), `Layout/Card` (4). `Layout/Band` (12) lives on the Banding page.

Still to build: `Chrome/Nav`, `Chrome/Footer`. Everything after those — case-study tile, heroes, prose and image blocks, quote, outcome — waits on the three case studies, because their shape is a content decision.

**Contact is a `mailto:`, not a form.** No backend, and a portfolio contact form converts worse. Input and Form are deliberately not in the inventory.

`Layout/Card` is the only slot user: `media`, `content`, `actions`. Padding sits on the body frame, not the card, so media bleeds to the edge while content stays inset.

Machine-readable, same pattern as banding: `page.getSharedPluginData('components', 'spec')` returns the schema, per-component props, code-only props and build notes; each component carries `getPluginData('component')`. Section `08 · Machine-readable spec` renders that JSON on canvas.

### Plugin API traps found while building

These cost rebuild cycles and are not obvious:

- **`INSTANCE_SWAP` defaults take a node id, not a component key.** The key fails validation.
- **`setTextStyleIdAsync` reclaims `textDecoration`.** Apply underline in a *later* pass or it silently reverts to `NONE`.
- **Inside a component set, layers matched by name sync text style and decoration across variants.** Components that must differ typographically have to be separate sets — this is why `Action/Link` and `Action/Arrow Link` are two components, not one set with a `variant` axis.
- Slots exist: `component.createSlot()` returns a `SLOT` node and auto-creates its property. It is *not* `figma.createSlot`.
- **A `SLOT` is not an auto-layout frame.** Children placed inside one cannot use `FILL` sizing — set `FILL` on the slot itself and size the content explicitly.
- **`SLOT` carries its own fill, opaque white by default.** Clear it (`slot.fills = []`) or it paints over the band: invisible on a light band, a white box on an inverse one.
- Deleting a `SECTION` deletes the component sets inside it. Moving a set into a section then removing the section destroys the set.

## Banding

`docs/banding-system.md` — band roles, foreground inheritance, adjacency rules, vertical scale, measure. Built on Figma page **Banding** (5 sections).

Bands are **relative, not absolute**: a band declares a tonal role and the mode resolves it. Hardcoding `#ffffff`/`#f7f7f7`/`#000000` would break dark mode.

**Four roles, two variables.** `inverse` and `inverse-raised` are `band/base` and `band/sunken` *under an inverted mode* — not separate fills. An inverse band is the same band in the other theme.

**A band owns the foreground of everything inside it.** In Figma that's `setExplicitVariableModeForCollection` on the band frame — it cascades to grandchildren, so an instance dropped into an inverse band flips at **zero overrides** (asserted in section 03). In CSS it's one attribute re-declaring the custom properties. Caveat: CSS redeclaration is *relative*, Figma's override is *absolute*, so Figma bands must be re-pointed when the same layout is shown in the other theme.

Don't reach for `bg/inverse` when you mean a band — it's `#191c1f`, the app surface, not band black.

**The spec is machine-readable**: `page.getSharedPluginData('banding', 'spec')` returns the whole rule set as JSON, and every band node carries `getPluginData('band')` → `{role, scale}`. A page built from bands can be linted against the adjacency rules rather than checked by eye.

## Skills

Two project skills in `.claude/skills/`, deliberately non-overlapping:

- **`emil-design-eng`** — motion and interaction craft (Emil Kowalski's design engineering philosophy). Easing, durations, press feedback, transform-origin, interruptibility, reduced motion. Carries a "Project overrides" section: no shadows in site chrome, motion values bind to tokens, everything resolves inside an `inverse` band.
- **`anti-slop`** — layout, content, and copy discipline. The tells that make a page read as AI-generated: eyebrows on every section, fake div screenshots, scroll cues, decorative dots, section-number labels, hairline spec tables, filler copy. Ends in a pre-ship checklist.

`anti-slop` is trimmed from a general `design-taste-frontend` skill. Three of its rules were **removed, not softened**, because they contradicted settled decisions: the one-theme-per-page lock (kills the banding system), the ban on Inter (Inter is settled, and matches Revolut), and the anti-derivative aesthetic test (the Revolut match is deliberate). Its opening section lists what it may not re-open.

A third skill, `impeccable`, was evaluated and rejected: it's the frontmatter of an npm-packaged skill, with unresolved `{{scripts_path}}` placeholders and ~10 missing `reference/*.md` and `scripts/*.mjs` files it calls mandatory. It would fail on first invocation.

## Next up

1. **The three case studies** — which three, and what each is *for*. Recommended first: components built before the content is known tend to get built twice. Also gates the band *rhythm* (§7 of the banding doc).
2. **Components** — button (48px pill, replacing `Demo / Button (stand-in)`), input (56px), nav (56px), card at r20, case-study tile, footer.
