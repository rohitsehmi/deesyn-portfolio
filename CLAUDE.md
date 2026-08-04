# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A portfolio website showcasing a **maximum of three case studies**, for Rohit Sehmi's design work.

Started 2026-07-31. **Stack: Astro + React.** Astro for the site and MDX case studies so pages ship no JS unless a component opts in; plain React for components so Storybook and Chromatic work normally.

```bash
npm run dev          # Astro dev server
npm run storybook    # component workshop
npm run tokens       # tokens.json -> src/styles/tokens.css
npm run specs        # Figma export + code-only components -> <domain>/specs/
npm run verify       # token, component and CSS integrity, exits non-zero on failure
npm run verify:bands # band adjacency, linted off built HTML (run after build)
npm run chromatic    # visual regression (needs CHROMATIC_PROJECT_TOKEN)
```

**The Chromatic project token is a write credential.** It lives in `.env` (gitignored) and a GitHub Actions secret, never in the repo or on a command line. `.env.example` documents it.

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

File **"Revolut"** — `UnybX8G5sQIEhLLZN2YFl6`. Pages, and the repo folder each mirrors:

| Page | Repo | Holds |
|---|---|---|
| **Foundations — Revolut** | `tokens/` | 246 tokens, 23 text styles, specimens |
| **Banding** | `docs/banding-system.md` | `Layout/Band` + adjacency rules |
| **Icons** | `icons/` | the icon set |
| **Marks** | `marks/` | brand marks |
| **Components** | `components/` | the 9 UI components |

The original "Foundations" page (an Expedia EGDS template) is reference scaffolding only — not ours.

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

**Components must reference `semantic.*`, never `primitive.*`** — that split is what makes re-theming a one-file change. Exception by design: spacing, radius and sizing bind to `Space/*`, `Layout/*`, `Radius/*` and `Size/*` primitives, because there are no semantic equivalents and those values don't re-theme.

**`fg/tertiary` is not a text colour.** It's `#c9c9cd` in light mode — **1.65:1 on white**, failing AA for body *and* large text. Dividers, disabled states and decorative marks only; low-emphasis text uses `fg/secondary` (4.87:1). It passes in dark mode (5.28:1), which is precisely why it went unnoticed — 42 text nodes across the file were using it. Re-pointing can't fix it: any grey hitting 4.5:1 on white is already `fg/secondary`. See `tokens/README.md`.

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

Naming groups by purpose: `Layout/*`, `Action/*`, `Chrome/*`, `Content/*`. Variant props are **lowercase** (`variant=primary, size=lg`), booleans kebab-case, slot names lowercase nouns.

**96 variants across 12 sets, split across three pages:**

- **Icons** (`icons/`) — `Icon` (14). Real Revolut assets, filled paths, verbatim from `assets.revolut.com`. `arrow-up-right` is `ArrowThinRight` rotated +45°; Revolut ships no diagonal arrow and no plain `ArrowRight` either.
- **Marks** (`marks/`) — `Brand/Logo` (2). `wordmark` is now the **Ro × Revolut lockup** (233×48), `mark` is Rohit's disc alone (48×48). Both exported from Figma node `21:4229` into `src/components/logo-paths.ts`; the RS text stand-in is gone. The disc is a single `evenodd` path with the script cut out rather than drawn on top, which is what lets the whole thing take `fill: currentColor` and still read on an inverse band. Variant names are kept from the Figma set even though `lockup` would now be more accurate than `wordmark`.
- **Components** (`components/`) — `Action/Button` (27), `Action/Icon Button` (27), `Action/Link` (2), `Action/Arrow Link` (2), `Content/Tag` (2), `Content/Media` (8), `Layout/Card` (4), `Chrome/Nav` (4), `Chrome/Footer` (2), `Chrome/Theme Toggle` (2).

`Layout/Band` (12) stays on the Banding page — a page-layout primitive with adjacency rules, not a UI component.

**Icons and marks are not components.** An icon is a flat, growing asset collection with no configuration axis; a mark is brand furniture where `variant` selects an asset rather than expressing state. Both are consumed *by* components — `Chrome/Nav` nests both.

`Action/Icon Button` is square: one size token drives both axes, so `Radius/Round` is a true circle at 32/44/48. Separate from `Action/Button` because the shape contract differs *and* **`aria-label` is required, not optional**.

**Resolved 2026-08-04.** The chrome used to present Revolut's wordmark alone, which read as claiming their identity. It now uses the lockup, which says work made *for* Revolut. One thing still to settle before anything is published openly: an `×` lockup conventionally reads as a partnership. Sent to Revolut as an application it is exactly right; on an open URL it implies an engagement that does not exist.

`src/components/` holds the React implementation — one file plus one CSS file per component, consuming tokens as CSS custom properties. `src/components/Band.tsx` implements the banding system: `data-band` re-declares the semantic properties for its subtree, which is the CSS equivalent of Figma's mode override.

**Three things live only in code, because Figma cannot express them:**

- **State is CSS, not a variant.** Figma needs `state=hover|disabled` as a variant axis; code uses `:hover` and `:disabled`. Same contract, different mechanism.
- **Press feedback.** `transform: scale(0.97)` over `duration/press` with `easing/out`.
- **Required props.** `IconButton`'s `aria-label` is a required TypeScript prop — the type system enforces what a variant never could.

Every story renders inside a band, and the Storybook toolbar switches the band role, so the zero-override property is checked the same way it is asserted in Figma. Chromatic snapshots each story light and dark.

### Contracts

The spec lives **on each component set**, not in a page-level blob: `set.getSharedPluginData('spec', 'contract')`, rendered on canvas in that component's own section.

Mirrored in the repo under `icons/specs/`, `marks/specs/`, `components/specs/` — one JSON + one Markdown per component, generated from the nodes' *bound variables*, not from plugin data or prose.

```bash
node design/build.mjs             # Figma-backed specs
node design/build-code-specs.mjs  # code-only component specs
node design/verify.mjs            # integrity + no-literals + checksum
node design/verify-css.mjs        # every var(--*) in src/ resolves; type bound to the scale
node design/verify-bands.mjs      # adjacency rules, read from the Figma spec
```

`design/verify.mjs` **cross-checks every token against `tokens/tokens.json` and exits non-zero if one is missing**, so the two systems cannot drift apart silently. It also asserts zero literals, and prints a checksum that `design/figma-export.snippet.js` reproduces from inside Figma. Matched 2026-08-04: `4097978953`, 132 entries. See `design/README.md`.

**Three checksums, three sources.** Tokens `4115829316`. Figma components `4097978953`. Banding spec `2118911321`, reproduced from inside Figma by `design/banding-export.snippet.js` (matched 2026-08-04). Code-only specs print `3037882434` but have no Figma counterpart to match, by definition.

**Six components exist only in code**, with no Figma set: `Content/Section Heading`, `Prose`, `Metrics`, `Explorations`, `Hindsight`, `Contribution`. Their contracts are things a variant cannot express, so building them in Figma would document them *less* precisely. `design/build-code-specs.mjs` measures them from source instead: props from the TypeScript declarations, tokens from their own stylesheets, don'ts from `usage-rules.json` like every other component. 17 React components, 17 specs.

`design/verify-css.mjs` covers what was written by hand rather than measured off Figma: **every `var(--*)` in `src/` must resolve against `tokens.json`**, and every font value must bind to `var(--type-*)`. A typo'd custom property is not a CSS error, it renders as an inherited default and looks deliberate, and nothing else in the repo catches it.

`design/verify-bands.mjs` reads its rules from `design/banding-export.json`, measured off the Figma page rather than transcribed. **Every rule id in the spec must have a check or an explicit "covered elsewhere" declaration**, so adding a rule in Figma fails the build until someone implements it.

**Responsive type steps between two styles on the scale at a breakpoint; it never clamps.** A clamp renders sizes that exist in no design file. The case-study hero runs `display.s -> display.m -> display.l`.

**Measured vs authored, kept apart.** `design/figma-export.json` is read off the nodes — nobody wrote it, so it cannot flatter the system. `design/usage-rules.json` is authored: the failure modes someone would actually hit (ghost is not a primary action; never ship an icon-only button without `aria-label`; never fake a product UI out of rectangles). `build.mjs` merges them into each spec; the files stay separate so it is obvious which is which. Same split in Figma: `getSharedPluginData('spec','contract')` measured, `…'donts'` authored.

**Each component section on canvas carries** its reasoning (rendered from the set's own `description`, one source), its don't-rules, a readable contract table, and an in-context usage example in both a base and an inverse band. The raw contract JSON is deliberately *not* on canvas — a 12,000px JSON wall is documentation theatre. Machines read it from plugin data and the repo.

## Storybook and Chromatic

Storybook is the component workshop; Chromatic is visual regression on top of it. Chromatic project `6a70c473fc9430ebb1214df6`.

Every story renders **inside a band**, and the toolbar switches the band role — so the zero-override property is checked the same way it is asserted in Figma. Chromatic snapshots each story light *and* dark, so a regression in either mode fails.

```bash
npm run storybook     # dev
npm run chromatic     # publish a build (needs CHROMATIC_PROJECT_TOKEN)
```

**Published Storybooks are access-controlled**, inherited from the private GitHub repo — an unauthenticated request returns `401`. To share, invite people in Chromatic → Manage → Collaborate. **Do not make it public yet:** it contains Revolut's real icon assets and, in the lockup, their wordmark. Sent to Revolut that reads as close study; on an open URL it is their trademark on an artefact that is not theirs.

Build URLs are per-build. Anything you send out should use the project permalink, not the URL a run prints.

**Outstanding:** the project token was pasted into a chat transcript on 2026-08-03 — rotate it in Chromatic → Manage → Configure, then update `.env` and the GitHub Actions secret.

## Banding

`docs/banding-system.md` — band roles, foreground inheritance, adjacency rules, vertical scale, measure. Built on Figma page **Banding** (5 sections).

Bands are **relative, not absolute**: a band declares a tonal role and the mode resolves it. Hardcoding `#ffffff`/`#f7f7f7`/`#000000` would break dark mode.

**Four roles, two variables.** `inverse` and `inverse-raised` are `band/base` and `band/sunken` *under an inverted mode* — not separate fills. An inverse band is the same band in the other theme.

**A band owns the foreground of everything inside it.** In Figma that's `setExplicitVariableModeForCollection` on the band frame — it cascades to grandchildren, so an instance dropped into an inverse band flips at **zero overrides** (asserted in section 03). In CSS it's one attribute re-declaring the custom properties. Caveat: CSS redeclaration is *relative*, Figma's override is *absolute*, so Figma bands must be re-pointed when the same layout is shown in the other theme.

Don't reach for `bg/inverse` when you mean a band — it's `#191c1f`, the app surface, not band black.

**The spec is machine-readable**: `page.getSharedPluginData('banding', 'spec')` returns the whole rule set as JSON, and every band node carries `getPluginData('band')` → `{role, scale}`. A page built from bands can be linted against the adjacency rules rather than checked by eye.

**The reasoning is on canvas too.** Section `00 · The system` renders the explanation from `docs/banding-system.md` in Figma, so the page is self-explaining without the repo open. Its role-table swatches are live — bound to `band/base` / `band/sunken` under explicit mode overrides — so "four roles, two variables" demonstrates itself instead of being claimed.

## Skills

Two project skills in `.claude/skills/`, deliberately non-overlapping:

- **`emil-design-eng`** — motion and interaction craft (Emil Kowalski's design engineering philosophy). Easing, durations, press feedback, transform-origin, interruptibility, reduced motion. Carries a "Project overrides" section: no shadows in site chrome, motion values bind to tokens, everything resolves inside an `inverse` band.
- **`anti-slop`** — layout, content, and copy discipline. The tells that make a page read as AI-generated: eyebrows on every section, fake div screenshots, scroll cues, decorative dots, section-number labels, hairline spec tables, filler copy. Ends in a pre-ship checklist.

`anti-slop` is trimmed from a general `design-taste-frontend` skill. Three of its rules were **removed, not softened**, because they contradicted settled decisions: the one-theme-per-page lock (kills the banding system), the ban on Inter (Inter is settled, and matches Revolut), and the anti-derivative aesthetic test (the Revolut match is deliberate). Its opening section lists what it may not re-open.

A third skill, `impeccable`, was evaluated and rejected: it's the frontmatter of an npm-packaged skill, with unresolved `{{scripts_path}}` placeholders and ~10 missing `reference/*.md` and `scripts/*.mjs` files it calls mandatory. It would fail on first invocation.

## Next up

1. **The three case studies** — which three, and what each is *for*. Recommended first: components built before the content is known tend to get built twice. Also gates the band *rhythm* (§7 of the banding doc).
2. **Components** — button (48px pill, replacing `Demo / Button (stand-in)`), input (56px), nav (56px), card at r20, case-study tile, footer.
