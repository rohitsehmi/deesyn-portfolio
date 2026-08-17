# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

Rohit Sehmi's design portfolio: **one to two recent, complex screen flows**, written up properly rather than a gallery of projects.

**What a case study here has to answer**, in this order, because it is the order someone reads them in: the problem (an insight, not a mandate someone handed down), the process (explorations, **the alternatives rejected and why**, trade-offs made from testing), the interface (a complex flow made simple), and the impact (**a specific personal role**, concrete metrics rather than summaries). Then hindsight, which is the section most portfolios leave out and the cheapest one to be honest in.

The failure mode this is built against: **case studies that lack detail, skip the testing, or assert impact without a number.**

**The design system underneath answers none of those questions directly.** No reader asks about tokens, checksums or visual-regression CI. It buys consistent, polished visuals cheaply and it is a good vehicle for them. It is not evidence of problem-solving, and it must not take page space it has not earned.

Started 2026-07-31. **Stack: Astro + React.** Astro for the site so pages ship no JS unless a component opts in; plain React for components so Storybook and Chromatic work normally. There is no MDX — case studies are `.astro` arrangements over JSON copy, described under **Case studies** below.

```bash
npm run dev          # Astro dev server
npm run storybook    # component workshop
npm run tokens       # tokens.json -> src/styles/tokens.css
npm run specs        # Figma export + code-only components -> <domain>/specs/, plus the favicon
npm run favicon      # brand mark + tokens -> public/favicon.svg and the PNG fallbacks
npm run typecheck    # tsc --noEmit; nothing else in the repo reads TypeScript
npm run verify       # typecheck + token, component and CSS integrity, exits non-zero on failure
npm run verify:bands # band adjacency, linted off built HTML (run after build)
npm run chromatic    # visual regression (needs CHROMATIC_PROJECT_TOKEN)
```

**The Chromatic project token is a write credential**, and this repo is public. It lives in `.env` (gitignored) and a GitHub Actions secret — never in a tracked file, never on a command line, because shell history is a file too. `.env.example` documents it. **Rotated 2026-08-13, and verified by a passing build rather than by a file timestamp.**

That distinction is the whole lesson. This file previously said "Rotated 2026-08-07" in this spot while three other places still said rotation was outstanding, and the evidence offered for the former was `.env`'s modification time. A timestamp proves a write happened, not that what was written authenticates — and it did not: `npm run chromatic` failed `GRAPHQL_ERROR / Failed to authenticate`, and so did CI, for six days, on a token of the right length and shape. **The only proof a credential works is using it.**

`design/verify-secrets.mjs` is the check that enforces it, in `npm run verify` and in CI. It scans **tracked files only**: `.env` legitimately holds the token, and flagging it would train everyone to ignore the check. What it catches is the moment a value moves from an ignored file into a tracked one. It never prints the match — echoing a secret into a CI log is the same mistake one step further on.

## Decisions already made — do not re-litigate

| Decision | Choice | Note |
|---|---|---|
| Typeface (display) | **Hanken Grotesk** | Stand-in for Aeonik Pro, which is licensed (CoType Foundry) and not installed |
| Typeface (body/UI) | **Inter** | Mirrors Revolut's own Aeonik-marketing / Inter-product split |
| Brand match | **Near-exact Revolut match** | The risk of reading as derivative was raised and accepted. Settled. |
| Theming | **Dual light/dark from the start** | Via Figma variable modes |
| Accent | **Blue** — `#0666eb` light / `#6fa0ff` dark | Matches the *website*. Revolut's app accent `#ea035d` never renders on revolut.com |

## Source of truth for brand values

**`docs/revolut-design-foundations.md`** — verified against Revolut's live CSS, not eyeballed.

Rule: **measure the live site; don't trust secondhand design docs.** A third-party spec (getdesign.md) was checked against source and got the accent colour and max-width wrong, while correctly catching two things we'd missed. Details in that doc.

## Figma

File **"Revolut"** — `UnybX8G5sQIEhLLZN2YFl6`. This is the file everything below is measured from; the Wise file is a lockup swap and nothing in the repo reads it (see § Brands). Pages, and the repo folder each mirrors:

| Page | Repo | Holds |
|---|---|---|
| **Foundations** | `tokens/` | 249 tokens, 23 text styles, specimens |
| **Banding** | `docs/banding-system.md` | `Layout/Band` + adjacency rules |
| **Icons** | `icons/` | the icon set |
| **Marks** | `marks/` | brand marks |
| **Components** | `components/` | the 10 UI components |
| **Case study imagery** | `src/assets/` | Hotels.com app screens, exported as case-study artwork |

The page is called **`Foundations`**, not `Foundations — Revolut`. It was renamed at some point and this file said otherwise until 2026-08-10. The Expedia EGDS template page that used to sit alongside it as reference scaffolding has been deleted; the eight pages in the file are now Cover, Case study imagery, a divider, Foundations, Icons, Marks, Components and Banding.

**`Case study imagery` is content, not system**, which is why it sits above the divider with Cover rather than below it with the design system. 22 frames, 11 compositions each existing as a light/dark pair, named `hcom-<subject>-<variant>-<theme>` so a frame name is the filename it exports to. All carry PNG @2x export settings with no suffix.

Inside a frame the tree is `Backdrop` (`Mesh 1–4`, `Base`) and either `Capture` or `Screens › Screen N › Device › Capture` + `Status bar mask`. **That structure is the export contract:** selecting `Screens` gives the phones on transparency, selecting `Backdrop` gives the plate alone. Exporting a whole frame bakes the backdrop into the picture, which is right for a still and wrong for a gallery — see `Content/Carousel` below.

Connect via the **Figma Console MCP**: Figma desktop → Plugins → Development → **Figma Desktop Bridge** (manifest `~/.figma-console-mcp/plugin/manifest.json`). The plugin window must stay open.

`FIGMA_ACCESS_TOKEN` is **not configured**, so every REST-backed tool *on that server* 403s — including `figma_get_file_data` and `figma_take_screenshot`. Use instead:
- `figma_execute` for all reads and writes (plugin sandbox)
- `figma_capture_screenshot` for visuals (plugin `exportAsync`, not REST)

**Image bytes cannot be moved from Figma into the repo by tooling.** There is no disk cache and a 1448×1086 PNG as base64 is far too large to return, so `exportAsync` bytes cannot cross. `figma_capture_screenshot` can *show* an image but cannot write a file. Real asset exports are done by hand: set `exportSettings` on the frames so the layer name becomes the filename, then export from Figma. They land in `~/Downloads`.

### Plugin API gotchas that cost rebuild cycles

- `figma.currentPage = page` throws under `documentAccess: dynamic-page` — use `await figma.setCurrentPageAsync(page)`.
- **`resize()` flips BOTH axes to FIXED**, silently collapsing auto-layout frames to 1px. Correct order: `layoutSizingHorizontal='FIXED'` → `resize(w, h)` → `layoutSizingVertical='HUG'`.
- Wrapping frames need `primaryAxisSizingMode='FIXED'` *and* an explicit width, or they grow in one line instead of wrapping.
- Children of a `SECTION` use **section-relative** x/y, not absolute canvas coords.
- Always verify layout numerically or by screenshot after building — collapsed frames still report success.

## Repository

`https://github.com/rohitsehmi/deesyn-portfolio` — **public as of 2026-08-07.** Renamed from `revolut-case-studies` on 2026-08-13: the old name announced who the work was for from the URL alone, before anyone clicked. GitHub 301-redirects the old address, so existing links survive; the live site's link was updated at the same time, because a rename that leaves the old URL rendered on the page has changed nothing.

It was private up to that point, and going public set one standing rule: **the repo is read by the same people who read the site.** Working notes about what a page is weak at, or what a claim is inferred from, belong in a conversation and not in a tracked file. The technical record — why a token is shaped a certain way, why a check exists, what broke and how it was caught — is the part worth publishing, and it is most of what is here.

The design system reconstructs Revolut's public brand values under their name, from their live CSS, as a study. See `docs/revolut-design-foundations.md`.

`memory` (symlink to `~/.claude/projects/…`) and `.claude/settings.local.json` are gitignored on purpose — the first would commit a broken absolute path, the second is machine-specific.

## Brands

**One build serves three brands, chosen by hostname.** `www.deesyn.com` shows Ro × Revolut; `wise.deesyn.com` shows Ro × Wise (2026-08-13); `healf.deesyn.com` shows Ro × Healf (2026-08-14). Each carries its own hero copy and its own Figma receipt.

**The third brand is what proved the mechanism, because it broke three things the second one had left hidden.** All three were latent from the day Wise shipped and none of them could fail with only two brands:

- **The CSS did not survive a third arm.** `:root:not([data-brand='wise'])` also matches the Healf hostname, so the default arm hid Healf's content while Healf's own arm hid Revolut's, and the page rendered **neither**. The default arm keys off the *absence* of `[data-brand]` now, which is what "default" actually means — the inline script sets the attribute for every brand except the default one. Same fix on the grid-count rules in `index.astro`.
- **Anything hardcoded to two brands silently drops the third.** The hero was two literal `<span>`s; adding Healf's copy without its markup rendered an **empty `<h1>`** on that host — a heading with no accessible name at all, which is worse than the wrong name. The hero and the receipts list are driven off `BRANDS` now.
- **Resizing a Figma component with `SCALE` constraints distorts its artwork.** Narrowing the lockup 224 → 192 at a fixed 48 height multiplied every x by 0.857 and turned the disc into an ellipse. `SCALE` is right for a logo — an instance on the cover has to scale — so the fix is not a different constraint but a different procedure: pin the vector to `MIN` for the duration of the resize, then put it back. Recovering the geometry is a resize back to the original width, because Figma keeps vector data at full float precision and the round trip is lossless where a retyped path would not be.

The site is prerendered and **one Vercel deployment answers every `*.deesyn.com` host**, so the brand cannot be decided at build time. Everything brand-specific therefore ships in *both* forms, marked `data-brand-only="revolut|wise"`, and a blocking inline script in `Base.astro` sets `[data-brand]` on the root from `location.hostname` before the first paint — the same no-flash pattern as the theme. The rules are three lines at the foot of `src/styles/base.css`.

**Revolut is the default and carries no attribute**, so www, the apex, any unrecognised subdomain and a client running no JavaScript all get it.

Why one project rather than one per brand: a second Vercel project means a second certificate, and **a hostname enters the public Certificate Transparency log the moment it is issued one**. A single wildcard cert keeps company names out of it.

- **The rules only ever hide.** Nothing declares a `display` value on the version that is showing, so a brand variant keeps whatever its own component stylesheet gives it and lays out identically on every host. Each rule selects the version that does *not* belong to the current brand, via `:not()`.
- **`display: revert` is what that replaced, and it was a real bug** — fixed 2026-08-14, found on the live Wise host. `revert` goes back to the **user-agent** stylesheet, not to the author rule it was overriding, so a shown element got the browser default for its tag. The three receipts on `/how-this-was-built` are a `ul` that `.hb-links` lays out as a grid, three across above 768px; reverted to the UA `display: block` they stacked full-width with no columns and no grid gap, so Wise rendered them misaligned while Revolut was correct. **The hero spans escaped it only because a `span` is inline either way**, which is how it stayed hidden — the one element that had a layout to lose was the one that lost it.
- **Specificity is still load-bearing**, and `:not()` carries it now. `.hb-links { display: grid }` is one class and `base.css` loads before component styles, so a single `[data-brand-only]` loses on source order and both link lists render at once — that is the bug this had first, and the Revolut page showed the Wise receipts. Each rule is three or four attribute selectors, which clears any single class.
- **`display: none`, not `visibility` or clipping.** The version that is not showing has to leave the accessibility tree completely, or a screen reader reads both headings and both link lists.
- **`Logo` ships both logotypes in one SVG.** `wordmark` renders Rohit's disc, the `×`, and then both companies' logotypes as sibling paths, each tagged `data-brand-only`. The default accessible name is brand-neutral because it is baked in at build time.
- **The analytics events carry `brand`, read off `[data-brand]`** rather than re-derived from `location.hostname`, so the number can never disagree with what was on screen. Views were always splittable by hostname in the Vercel dashboard; the custom events were not.
- **Per-brand copy lives under `brands.<brand>` in the same JSON file**, keyed to mirror the default path — `home:brands.wise.heroTitle` beside `home:heroTitle` — so the browser editor and the markdown round trip reach both without a second mechanism.
- **`src/data/brands.ts` is the one list**, added 2026-08-14. `BRANDS`, the `Brand` type and `DEFAULT_BRAND`. The CSS, the inline script in `Base.astro` and `Logo.tsx` cannot import it — two are CSS and one is an inline script that must not pull in a module — so adding a brand still means touching those by hand, and this is where to start reading.

**A whole case study can belong to one brand, as of 2026-08-14** — `brand?: Brand` on a `Study`, absent meaning every brand. `wise-placeholder` was the first user and was **deleted on 2026-08-17**; `scaling-a-system` is the second, scoped to Wise and Healf so the default brand keeps two studies, one per discipline. Five things this settled that a hidden `<span>` never tested:

- **The list is build-time and the brand is runtime**, so `brand` decides what a hostname is *offered*, not what exists. `liveStudies` is still every live study across every brand, because the index has to render each tile into the one HTML document; `studiesFor(brand)` is what asks the narrower question. The page is prerendered at its URL on every host and stays reachable there whether or not that host links to it.
- **The field is a LIST, and `data-brand-only` matches with `~=` rather than `=`.** `brands?: Brand[]` since 2026-08-17, because the first real study to use it needed two hostnames out of three and a single value cannot say that. The CSS arms had been exact-string matches, which silently cannot express it: `[data-brand-only='wise']` never matches `"wise healf"`, so the tile would have been hidden on **both** hostnames rather than shown on both. `~=` matches one whitespace-separated token, so a single value keeps working untouched and the change was three selectors rather than every call site. **Anything else keyed to one brand by exact match has the same limit waiting in it.**
- **`data-brand-only` goes on the `<li>`, not on the tile.** Hiding the tile alone leaves the grid item, which on a two-column grid is a hole rather than a shorter list.
- **A count is per brand, and `display: none` does not fix one.** The index grid picks its columns from `data-count`, which was `liveStudies.length` — so adding a Wise-only study gave *every* host a three-column grid, and the default brand rendered two tiles beside an empty third column. **`display: none` removes a grid item; it cannot remove a track.** Hiding a tile is not the same as not having counted it. The count was then emitted once per brand — `data-count` for the default, `data-count-<brand>` for the rest — with the default's rules carrying `:root:not([data-brand='…'])` so both counts could not match at once. Anything else derived from how many things a brand sees has the same shape of bug waiting in it.

  **That whole mechanism is gone as of 2026-08-17, and its removal is the better fix.** The grid is capped at two columns at every width above 768px, so the track count no longer depends on how many tiles a brand can see, and there is nothing left to get wrong. Three across was the reason the count existed and it read as cramped: a tile carries a cover, a title and a summary, and at a third of the measure the summary ran to five or six lines while the cover lost the detail that justified it. A third tile now drops underneath the first two at the same width. **The lesson is that the per-brand count was a guard around a dependency that did not need to exist**, and two rounds of bugs were spent hardening it before anyone asked whether the grid had to count at all.

- **That prediction came true in the sentence directly above the grid — fixed 2026-08-17.** The hero read **"Two case studies, for Wise." above three tiles**, because `heroTitle` was written once for the default brand and copied per brand, while `wise-placeholder` made Wise's real count three. The grid attribute had been made per brand; the prose counting the same things had not. It shipped on a live host and survived review because both halves look deliberate — nothing renders as broken, the sentence is simply false.
  - **The number is derived, never typed.** `src/copy/home.json` carries a `{count}` token and `index.astro` substitutes the word from `studiesFor(brand).length`, the same `{braced}` pattern `how-this-was-built` already uses for build-time figures. **The hero is now the only thing on the page that counts anything**, the grid having stopped needing to, so `counts` exists in that file solely to fill this token.
  - **A typed number fails the build**, with the instruction in the message. A hardcoded count renders as a plausible sentence and is invisible in a diff, which is exactly how the original survived, so it is a throw rather than a convention. Verified by typing one and watching the build refuse it, not by reading the code.
  - **The hero lost its `data-copy` and that is the point, not a regression.** What renders has had its token substituted, so a browser edit would write `Two case studies` back into the JSON and stop the page recomputing — handing back the bug that was just fixed. Same rule, same reason, as the facts block on `how-this-was-built`. It stays editable through the markdown round trip, which works on the JSON; keep the braces.
  - **Singular is a build error, not a pluralisation engine.** The copy says "case studies", so one study would render "One case studies". Every brand has at least two and `nextStudy()` already guards that boundary, so the build fails with the instruction rather than carrying machinery for a case that does not exist.
- **The next-study band is one band with the tile chosen inside it**, never one band per brand. Two would be two adjacent `sunken` bands in the document, which breaks adjacency rule 1 for the linter and for anyone reading the HTML — and CSS hiding one does not change what is written down. For the same reason the *presence* of that band cannot vary by brand: the footer's fill is decided at build time from whether the band is above it. `nextStudy` is written so it cannot vary — a live study outside a brand's rotation falls back to that brand's first study rather than returning nothing — and `CaseStudy.astro` throws at build time if the brands ever disagree, rather than leaving a silent adjacency bug that only appears on one host.

**This is isolation by routing, not isolation by build**, and the distinction is the whole risk. Both brands' content is in every page's HTML on every host. That is fine while the brands are different framings of the *same* work and becomes a leak the day they hold different clients' work. `design/paths.mjs` grouping paths into framework / brand pack / content is the first step of the split that would fix it; there is deliberately **no brand switch** wired up yet, because a configuration path nothing exercises is a path that does not work.

**The Storybook and the repository are the same on every brand, deliberately.** They were briefly pulled from the Wise host on the grounds that they show work made under another brand's name, then reinstated: the shared engineering is what the receipts are *for*, and a reader who follows one is looking at how the site is built rather than at whose logo is in it. Recorded on the page rather than left implicit, including the condition that reverses it. The Figma link is the one receipt that does differ per host.

**Each brand has its own Figma file, and each is a structural copy of the Revolut one with its lockup swapped.** Wise `G3HBCm7Dsa6gQ2PKv0Y8g4` (cover `56:4387`, lockup 224×48); Healf `oC393wMf4jcRjm8qbkWTeG` (cover `11:2960`, lockup 192×48, logotype at node `22:4230` path 4). **Their tokens are still Revolut's blue.** These are lockup swaps, not brand packs.

`PARTNER_WORDMARKS` in `src/components/logo-paths.ts` keys the partner logotype by brand. Revolut is deliberately not in it — its logotype is the last entry of `LOCKUP_PATHS`, which is what a client running no JavaScript renders. All of them sit in the same `0 0 233 48` viewBox and share one slot starting at x=84.6, where the `×` glyph ends, fitted to y 8..40. Each logotype is a different width inside that box — Wise runs to 219.51, Healf to 191.18 — and none is rescaled to match; the trailing space simply differs, which at nav sizes is invisible. One `<svg>` per brand would be the alternative and would duplicate the 16kB disc on every page.

**Unmatched hostnames redirect to the apex, added 2026-08-14.** `*.deesyn.com` is attached to the project, so before this every name someone guessed — `healf.deesyn.com`, `monzo.deesyn.com` — served the whole site. `vercel.json` now carries a redirect whose `missing.host` names the four hosts that are real (`deesyn.com`, `www`, `wise`, `revolut`) and sends everything else to `https://www.deesyn.com`. Four things about it that are decisions rather than syntax:

- **A redirect, not a 404.** A 404 confirms the name you guessed was interesting enough to be handled specially; a redirect makes a guessed hostname look like an ordinary wildcard, and it also catches a typo like `wsie.` and lands it somewhere useful.
- **`missing`, not `has`.** "Any host except these" is a negation, and Vercel's host matching is RE2 — no lookaheads — so it cannot be written as a `has` regex. `missing` is the only way to express it.
- **`source` must be `/(.*)`, not `/:path*`** — this is what actually stopped it working, and it took two deploys to find. `/:path*` matched `/cv` and `/anything` but **not `/` and not any path ending in a slash**, and this site serves directory-style URLs, so `/`, `/cv/` and `/how-this-was-built/` — every address a person actually visits — sailed straight through while the rule looked live. The proof was in the same file all along: the `headers` block uses `/(.*)` and has always applied to every page.
- **The host pattern is anchored**, `^(?:(?:www|wise|revolut|healf)\.)?deesyn\.com$|^.+\.vercel\.app$`. Unanchored, `monzo.deesyn.com` *contains* `deesyn.com` and would count as allowed on a substring test. **Whether that was ever actually breaking anything is unproven** — the first diagnosis blamed it, and the redirect was still broken after fixing it, because the `source` was the real fault. Anchored is correct either way; it is recorded here as a belt-and-braces change rather than as a fix that was demonstrated.
- **Diagnosing it needed a non-root path.** Testing `/` alone cannot separate "the host condition never matches" from "the source pattern misses this URL", and both were live hypotheses. `curl` on `/cv` versus `/cv/` split them in one step.
- **`*.vercel.app` is on the allowlist**, and it has to be: without it every preview deployment bounces to production and there is no way to look at a build before promoting it. The cost is that this rule cannot be tested on a preview, which is why the next point matters.
- **`permanent: false` on purpose.** A 308 is cached by the browser and is very hard to take back if the pattern is wrong; a 307 costs one deploy to fix. It stays temporary until it has been checked against every real host in production, and moving it to permanent is a deliberate second step rather than the default.

**What is still Revolut-only on every host:** `og.png` (see below), the tokens, the icon set, and the Storybook's `Marks/Logo` stories.

## Tokens

`tokens/tokens.json` — W3C DTCG format, 249 leaf tokens, exported from Figma and checksum-verified against it (`2836674598`, matched 2026-08-10).

```bash
node tokens/build.mjs     # regenerate from tokens/figma-export.json
node tokens/verify.mjs    # checksum + alias integrity
```

The Figma-side export snippet lives in `tokens/figma-export.snippet.js` and returns the same checksum. **Don't rewrite it from memory** — it maps Figma's font *style name* to a numeric weight, and dropping that silently rewrites all 23 typography tokens.

**Components must reference `semantic.*`, never `primitive.*`** — that split is what makes re-theming a one-file change. Exception by design: spacing, radius and sizing bind to `Space/*`, `Layout/*`, `Radius/*` and `Size/*` primitives, because there are no semantic equivalents and those values don't re-theme.

**`fg/tertiary` is not a text colour.** It's `#c9c9cd` in light mode — **1.65:1 on white**, failing AA for body *and* large text. Dividers, disabled states and decorative marks only; low-emphasis text uses `fg/secondary` (4.87:1). It passes in dark mode (5.28:1), which is precisely why it went unnoticed — 42 text nodes across the file were using it. Re-pointing can't fix it: any grey hitting 4.5:1 on white is already `fg/secondary`. See `tokens/README.md`.

**Do not use the shadow tokens in site chrome.** revolut.com has zero `box-shadow`; depth is colour-banding and luminance. Shadows are for app mockups inside case studies only. See `tokens/README.md`.

## Current state

Built and visually verified on "Foundations":

- **`01 Primitives`** — 123 variables (colour ramp, white/black alphas, `sp50–sp1000`, layout scale, radius, sizing, breakpoints, `Duration/*`, `Easing/*`)
- **`02 Semantic`** — 48 tokens × Light/Dark, every one aliased to a primitive, nothing hardcoded
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

**97 variants across 12 sets, split across three pages:**

- **Icons** (`icons/`) — `Icon` (15). Real Revolut assets, filled paths, verbatim from `assets.revolut.com`. `arrow-up-right` is `ArrowThinRight` rotated +45°; Revolut ships no diagonal arrow and no plain `ArrowRight` either. `chevron-left` is `chevron-right` mirrored about x=12 as real path data — added 2026-08-13, see below.
- **Marks** (`marks/`) — `Brand/Logo` (2). `wordmark` is now the **Ro × Revolut lockup** (233×48), `mark` is Rohit's disc alone (48×48). Both exported from Figma node `21:4229` into `src/components/logo-paths.ts`; the RS text stand-in is gone. The disc is a single `evenodd` path with the script cut out rather than drawn on top, which is what lets the whole thing take `fill: currentColor` and still read on an inverse band. Variant names are kept from the Figma set even though `lockup` would now be more accurate than `wordmark`.
- **Components** (`components/`) — `Action/Button` (27), `Action/Icon Button` (27), `Action/Link` (2), `Action/Arrow Link` (2), `Content/Tag` (2), `Content/Media` (8), `Layout/Card` (4), `Chrome/Nav` (4), `Chrome/Footer` (2), `Chrome/Theme Toggle` (2).

`Layout/Band` (12) stays on the Banding page — a page-layout primitive with adjacency rules, not a UI component.

**Icons and marks are not components.** An icon is a flat, growing asset collection with no configuration axis; a mark is brand furniture where `variant` selects an asset rather than expressing state. Both are consumed *by* components — `Chrome/Nav` nests both.

`Action/Icon Button` is square: one size token drives both axes, so `Radius/Round` is a true circle at 32/44/48. Separate from `Action/Button` because the shape contract differs *and* **`aria-label` is required, not optional**.

**Resolved 2026-08-04.** The chrome used to present Revolut's wordmark alone, which read as claiming their identity. It now uses the lockup, which reads as work made *for* Revolut rather than by them.

**The lockup came out of the chrome on 2026-08-07 and went back in on 2026-08-10.** For those three days the nav rendered `variant="mark"` — Rohit's disc alone — which sidestepped the `×` question by dropping half the statement. Restored deliberately; the open question below is the one to answer, not to route around.

**Nav changes, 2026-08-10.** `Size/Nav` 56 → 64, changed in Figma and re-exported, because all four `Chrome/Nav` variants bind their height to it — one edit moved both sides. The mobile trigger went from a bare 24px `Icon` to an `Action/Icon Button` at `md`, so the touch target is 44 rather than 32 and clears Apple's 44pt minimum and WCAG 2.5.5. Below 768px the panel is now a **full-width sheet**: it enters from the trailing edge over `bg/scrim`, `translateX` only, `duration/overlay` on `easing/drawer` in and `duration/dropdown` on `easing/out` back, with the links staggered 40ms from the same edge. It ran briefly at `min(86vw, 360px)` so a strip of page stayed visible; full-bleed won because display-size links were crowded in a 335px column. The cost is that there is no outside to tap — dismissal is the close button and Escape, and the scrim is kept for the way in rather than as a hit target. It carries its own close, positioned to land exactly where the trigger that opened it was — which is why the old `z-index: 170` rule that raised the bar above the panel is gone. That rule existed because the close used to live in the bar; with a sheet it painted the header straight over it.

**`Content/Carousel` — added 2026-08-13.** A gallery of real screens for an exploration whose variants are better read one at a time than lined up at a third of the width each. `Carousel.tsx` renders it, `carousel-controls.ts` adds the behaviour. Wired into `making-the-app-testable` via an optional `carousel` on an `Explorations` item, mutually exclusive with `image`.

**It is scroll-snap, not a transform track**, and that decides most of the rest. With JavaScript off the gallery still works: every slide is in the HTML, it swipes natively on a phone and scrolls with the keyboard. The script adds arrows, dots and autoplay on top, which is why **the controls are hidden until it marks the root `data-enhanced`** — a visible arrow that does nothing is worse than no arrow. The transition is the platform's own scroll rather than a tokenised animation, the one deliberate exception to binding motion to the scale: scroll physics belong to the device and are interruptible by definition.

**The backdrop is a sibling of the track, never part of a slide.** Baking it into each exported image means every advance repaints it, and any difference between exports reads as the background twitching. One element behind a transparent track cannot twitch, and it holds its box across a theme change because only the fill swaps — verified at 920×690, x=180 in both modes. This is what the `Screens` / `Backdrop` export split on the Figma page exists for.

**Autoplay rules, all load-bearing:** `prefers-reduced-motion` disables it outright; any deliberate input ends it for the life of the page; off-screen pauses it. **Focus pauses it and hover does not**, which was measured rather than assumed — the stage fills most of the reading column, so a pointer resting anywhere near the text sat inside the carousel and held it at slide one indefinitely (0 → 0 over eleven seconds, against 0 → 2 with the pointer away). A feature that only runs when the cursor is elsewhere reads as broken. Focus is different: it means someone is working through it with a keyboard or a screen reader, and moving content under them is the failure WCAG 2.2.2 exists for.

**It loops forward through a cloned first slide rather than rewinding.** Wrapping by scrolling back to the start drags the whole track past in reverse, which reads as a fault. The script appends an `aria-hidden` clone of slide one, advances into it, then resets the scroll position in a single frame — the same pixels either side of the swap. The clone is built in JS, not markup: without the script there is no autoplay to wrap, and a duplicate slide in the HTML would be a duplicate for everyone. The announced count stays "3 of 3". The one move with no clone to hide it is pressing *previous* on the first slide, which jumps instantly instead.

**Targets and contrast are measured, not asserted.** Arrows 44×44 (WCAG 2.5.5, and Apple's 44pt), dots 24×24 (WCAG 2.5.8). The dots were 16×16 and **failed** — the hit area and the visible dot were the same box. The arrows overlay a photographic backdrop, so 1.4.11 applies: the button fill is only 4% black in light and 14% white in dark, so the plate is 1.07:1 against the backdrop and the **border** carries the boundary at 12.97:1 light and 8.61:1 dark, with the glyph at 12.15:1 and 5.54:1.

**`chevron-left` is a real asset as of 2026-08-13**, and the carousel's previous button uses it. It is `chevron-right` mirrored about x=12 as path data, not a transform: Revolut's own `chevron-up` and `chevron-down` are exact vertical mirrors of each other, so mirroring is how this set relates its chevrons and the result is the geometry Revolut would ship. Every vertex was checked against the SVG Figma exports for the node, 11 of 11 in order, and the repo checksum reproduces Figma's (`4180069571`).

It replaced a `scaleX(-1)` on the glyph, which worked and had precedent but was the weaker answer for a reason worth keeping: **a CSS flip is invisible to the contract.** The published spec said that button used a right-pointing chevron, because the spec is measured from Figma and Figma had no idea. Anything else that later transformed that glyph would also have had to remember to compose with it.

**`carousel-controls.ts`, not `carousel.ts`.** macOS is case-insensitive, so `./Carousel` resolved to the script rather than the component and the build broke. It is a `.ts` for the same reason as `number-ticker.ts` — it must move neither the component count nor the contract count.

**Impact numbers count up — added 2026-08-10.** `src/components/number-ticker.ts` animates the `Metrics` values from zero when the grid reaches 60% on screen, staggered 80ms, over `duration/counter` on `easing/out`.

Three things about it that are the point rather than the implementation:

- **It is a page script, not a hydrated component.** `Metrics` renders server-side with no client directive, so the real number is in the HTML and a case study still ships no React for it. The animation is an enhancement on a correct page — with JS blocked a reader sees `+85%`, never `0`. Hydrating with `client:visible` would ship React to re-render a number already on screen *and* put a running animation inside every Chromatic snapshot.
- **The curve is read from the token, not approximated.** `getComputedStyle` on `--semantic-easing-out`, then a small Newton-Raphson bezier solver evaluates it. Hand-rolling something that "looks similar" is the exact drift tokens exist to stop.
- **It refuses `[NEEDS: …]` explicitly.** A gap marker containing a digit would otherwise count up to it, turning a visible reminder into what looks like a real measurement.

Formatting survives the count: prefix and suffix are preserved, decimal places are fixed from the authored value (`35.5%` never renders `35`), and thousands separators are re-grouped each frame (`1,000+` counts through `722+`). `.metrics__value` already carried `font-variant-numeric: tabular-nums`, so nothing reflows — verified: value box widths and label tops are identical for the whole animation.

`Duration/d800` and `duration/counter` were added to Figma for this, not typed into CSS.

**Two things about it that only showed in production**, both fixed 2026-08-10 after they shipped:

- **The CSS minifier rewrites `800ms` to `.8s`**, which is exactly equivalent CSS and completely changes what `parseFloat` returns: 0.8 instead of 800. The count ran for eight tenths of a millisecond, zeroing and finishing inside one frame, so it read as having already happened before you scrolled to it. It worked in dev, where the CSS is not minified, which is why it survived being tested. **Anything reading a duration token from CSS in JavaScript has to go through `cssMs()`** — every duration on the site is minified the same way.
- **`threshold` is a fraction of the element, not of the screen.** `threshold: 0.6` on a 107px-tall desktop grid fired once 64px of it had crossed the bottom edge, with the numbers still in the last tenth of the viewport, so the count was over before they were anywhere readable. It is a `rootMargin` of `0px 0px -35% 0px` with `threshold: 0` now, which says the thing the element's own height cannot: do not start until this has come up into the part of the screen someone is reading. Measured after: fires with the grid top 60–63% down the viewport on both desktop and phone. 800ms sits deliberately outside the interaction scale, which tops out at `d400`: that range exists to get out of the way, and a number has to stay legible while it moves.

**The card arrow was decoration that ate its own tap target — fixed 2026-08-10, found by user research.** `.tile__cue` is the 48px circled arrow on a case-study tile. It is `aria-hidden` and the whole tile is the link, via a stretched `.tile__link::after`. But the cue still took hit tests: a tap on it landed in the cue's subtree, found nothing that handled it, and bubbled to `.tile__body`, which is not a link. Measured before the fix: title, summary and image all navigated, the arrow alone did **NO NAV** on both mouse and touch — the one element that *looks* like the button was the only dead spot on the tile. `pointer-events: none` on the cue hands the hit to the stretched link underneath. Deliberately not a second `<a>`: a duplicate link to the same destination is a second tab stop and a second announcement for something that is already one target with one name.

**Footer, 2026-08-10.** Takes the lockup, at height 32, matching the nav — Figma already specified `variant=wordmark` here, so this was code catching up. Below 768px the bottom row is `column-reverse`, putting "How this was built" **above** the mark. Reversing visual order without reversing the DOM is normally a focus-order trap; it is safe here because `.footer__brand` holds no focusable element, so the row has exactly one tab stop.

**Contact is still the one `cta`.** It was removed on 2026-08-10 and restored the same day, and the round trip is worth recording because it located the real fault. The desktop treatment — filled pill, conic ring on hover — was never the problem. What looked wrong was the **mobile sheet**, where `cta` rendered the link in `fg/accent`: blue display-size text with no pill and no ring, which reads as a mis-styled link rather than as emphasis. The sheet no longer restates `cta` at all and shows both links at equal weight; two items one tap apart, with the whole list on screen, do not need a hierarchy imposed on them.

**Still open, and it matters more now the repo is public:** an `×` lockup conventionally signals a partnership. Sent directly to someone as a piece of work it is exactly right; sitting on an open URL it implies an engagement that does not exist. The site itself is `noindex` (`public/robots.txt` and the `X-Robots-Tag` header in `vercel.json`), which contains the problem without solving it.

`src/components/` holds the React implementation — one file plus one CSS file per component, consuming tokens as CSS custom properties. `src/components/Band.tsx` implements the banding system: `data-band` re-declares the semantic properties for its subtree, which is the CSS equivalent of Figma's mode override.

**Four things live only in code, because Figma cannot express them:**

- **State is CSS, not a variant.** Figma needs `state=hover|disabled` as a variant axis; code uses `:hover` and `:disabled`. Same contract, different mechanism.
- **Press feedback.** `transform: scale(0.97)` over `duration/press` with `easing/out`.
- **Required props.** `IconButton`'s `aria-label` is a required TypeScript prop — the type system enforces what a variant never could.
- **Theme-paired artwork.** `Media`'s `srcDark` — see below. A Figma frame carries both modes in one node; an exported PNG is one tonality, so the pair only exists in code.

**`Media` takes an optional `srcDark`, added 2026-08-13, and it is the exception rather than a new default.** Bands are relative and media is absolute: a photograph does not change with the theme, and most artwork here is a capture whose own background is part of the picture. This is for artwork exported from Figma that carries the theme in its fills, where shipping only the light version puts a white plate in the middle of a dark page.

It renders **both** images and lets CSS choose, rather than a `<picture>` with `media="(prefers-color-scheme: dark)"`. That looks like the tidier answer and is wrong here: a `<picture>` media query reads the OS setting and cannot see `[data-theme]`, so a reader who used the theme toggle would keep the other theme's image. The CSS mirrors the cascade in `tokens.css` exactly, including the `[data-theme='light']` branch — without it, choosing light on a machine set to dark leaves the dark artwork on a light page.

**The pair can cost two downloads.** Measured on a real build in Chrome, scrolled to the figure, no toggling: with the OS set to dark only the dark image was fetched, with the OS set to light *both* were. `loading="lazy"` defers a `display: none` image often enough to look like a rule and not often enough to be one, so assume the reader pays for both.

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

**`design/paths.mjs` holds every path these scripts read or write**, added 2026-08-13, and the grouping in it is the point rather than the deduplication. The constants are sorted into *framework* (the components, the code-only specs, the authored usage rules), *brand pack* (tokens, the Figma export, the Figma-measured specs, the marks and icons) and *content* (copy, drafts, assets). Nothing behaves differently — every value is the literal the scripts used to hardcode, and the build output was verified byte-identical across all 117 files after the change.

What it buys is that the boundary between shared machinery and one brand's identity is written where a program reads it, instead of being spread across a dozen string literals that happen to agree. Two things it records that were not obvious:

- **The code-only specs are brand-agnostic and the Figma-derived ones are not**, which is why they are in different groups despite sharing a directory today. `buildTokenMap()` maps custom properties to token *reference names* (`semantic.*.fg.primary`), never to values, so a code-only spec is identical whatever the tokens resolve to. A Figma-measured contract binds to whichever variables that file defines.
- **`verify-css.mjs` is the check that would matter most.** "Every `var(--*)` in `src/` resolves against `tokens.json`" is a typo-catcher against one token file; against a different one it is a completeness test for that file.

There is deliberately **no brand switch** in it — no env var, no second pack, no branch. A configuration path nothing exercises is a path that does not work, and finding that out later is worse than not having written it.

**`design/dist-hash.mjs` is how a refactor proves it changed nothing.** `--save` before, `--check` after, and the refactor is correct iff the tree is byte-identical. "It still builds" does not show that: a page can lose a stylesheet or an image drop a srcSet candidate and the build stays green.

It is only sound because the build is deterministic — verified by two clean builds producing the same digest — so `--save` builds **twice** and refuses to write a baseline it could not reproduce. A baseline taken from one build cannot tell "the output is stable" from "the output is nondeterministic and I caught one value", and that would fail every later check for a reason unrelated to the change.

Not in `verify`, and `design/.dist-baseline.json` is gitignored: a baseline is a moment in a refactor, not a property of the repo, and a committed one would go stale on the first legitimate content change.

**Deprecating a component:** set `setSharedPluginData('spec', 'status', 'deprecated')` on the set in Figma and rename it out of the live namespace. It stays in the file and leaves the published contract; the export lists it under `deprecated` and `verify.mjs` prints it, so its absence is recorded rather than silent. `Deprecated/Brand Logo` (was `XX · Brand/Logo`) is the first.

`design/verify.mjs` **cross-checks every token against `tokens/tokens.json` and exits non-zero if one is missing**, so the two systems cannot drift apart silently. It also asserts zero literals, and prints a checksum that `design/figma-export.snippet.js` reproduces from inside Figma: `4180069571`, 133 entries, matched 2026-08-13. See `design/README.md`. (An earlier `1567749477` was recorded here against the same entry count and was stale — **re-read a checksum from `verify.mjs` rather than trusting this file**, which is the only reason these are written down at all.)

**Three checksums, three sources.** Tokens `2836674598`. Figma components `4180069571`. Banding spec `2143010685`, reproduced from inside Figma by `design/banding-export.snippet.js` (matched 2026-08-05). Code-only specs print **`2152362939`** across 9 components and 228 entries, but have no Figma counterpart to match, by definition.

**That value was recorded here as `2397650938` and was stale, found 2026-08-17** by running `design/build-code-specs.mjs` and comparing. The regenerated specs were byte-identical to the ones committed, so the specs were right and only the number written down was wrong: a component changed at some point, the pre-commit hook regenerated and staged the specs exactly as designed, and nobody carried the new checksum up into this file. **This is the third time a stale checksum has sat in this document**, after `1567749477` and `2975374804`, which is the standing argument for re-reading one from the build rather than trusting the copy here.

**Nine components exist only in code**, with no Figma set: `Content/Section Heading`, `Prose`, `Metrics`, `Explorations`, `Hindsight`, `Contribution`, `CaseStudyTile`, `Parallax` and `Carousel`. Their contracts are things a variant cannot express, so building them in Figma would document them *less* precisely. `design/build-code-specs.mjs` measures them from source instead: props from the TypeScript declarations, tokens from their own stylesheets, don'ts from `usage-rules.json` like every other component. **21 React components, 21 with a published contract** — this file said six and 17/17 until 2026-08-10, when `CaseStudyTile` and `Parallax` had joined the list without it being written down, and said 20/20 until 2026-08-13.

`Content/Carousel` is the clearest case for code-only yet, and worth stating because "why is this not in Figma" is the obvious question. A variant axis can say a carousel has arrows. It cannot say that autoplay surrenders permanently the moment a reader touches a control, that the backdrop is a sibling of the track rather than part of a slide, or that the controls do not exist in the markup until a script has confirmed they work. Those three things *are* the component.

**`design/verify-contracts.mjs` is what stops that recurring**, and it exists because the claim on `/how-this-was-built` was true by luck. "N in code, M with a published contract" counted components from `src/components/*.tsx` and contracts from the *number of files* in the spec directories. Those agreed at 20 and 20, which read as complete coverage and was arithmetic coincidence: `Link.tsx` exports both `Link` and `ArrowLink` so it produces **two** specs, while `Band.tsx` produces **none** there because a band is a page-layout primitive whose contract lives in `design/banding-export.json` with the adjacency rules. Two errors that cancelled exactly. The page now asks the real question per component, and the check fails the build if any component cannot answer it. In `verify` and in CI.

An earlier version of that matcher tested `slug.endsWith()`, which looked tidy and was wrong: `Button` matched `action-icon-button` as well as `action-button`, so `IconButton` was silently covering for `Button`. It matches the whole domain-prefixed name now.

`design/verify-css.mjs` covers what was written by hand rather than measured off Figma: **every `var(--*)` in `src/` must resolve against `tokens.json`**, and every font value must bind to `var(--type-*)`. A typo'd custom property is not a CSS error, it renders as an inherited default and looks deliberate, and nothing else in the repo catches it.

`design/verify-bands.mjs` reads its rules from `design/banding-export.json`, measured off the Figma page rather than transcribed. **Every rule id in the spec must have a check or an explicit "covered elsewhere" declaration**, so adding a rule in Figma fails the build until someone implements it.

**`npm run typecheck` is part of `verify`, added 2026-08-05, because nothing else in the repo read TypeScript.** `astro build` transpiles without checking and Storybook renders a story whose props no longer exist rather than failing — which is how three stale `band="inverse"` props on `Parallax` survived the change that removed the prop, and five stories sat un-typechecked besides. `tsc` covers `.ts`/`.tsx`; it does not read `.astro`, which would need `@astrojs/check`.

**Responsive type steps between two styles on the scale at a breakpoint; it never clamps.** A clamp renders sizes that exist in no design file. The case-study hero runs `display.s -> display.m -> display.l`.

**Measured vs authored, kept apart.** `design/figma-export.json` is read off the nodes — nobody wrote it, so it cannot flatter the system. `design/usage-rules.json` is authored: the failure modes someone would actually hit (ghost is not a primary action; never ship an icon-only button without `aria-label`; never fake a product UI out of rectangles). `build.mjs` merges them into each spec; the files stay separate so it is obvious which is which. Same split in Figma: `getSharedPluginData('spec','contract')` measured, `…'donts'` authored.

**Each component section on canvas carries** its reasoning (rendered from the set's own `description`, one source), its don't-rules, a readable contract table, and an in-context usage example in both a base and an inverse band. The raw contract JSON is deliberately *not* on canvas — a 12,000px JSON wall is documentation theatre. Machines read it from plugin data and the repo.

## Case studies

**Three live, one archived.** `src/data/studies.ts` is the one list; the index and the next-study link at the foot of each study both read it, so they cannot disagree about what exists.

| Slug | Discipline | State |
|---|---|---|
| `machine-readable-components` | Design systems | **Live.** Expedia's New Component Architecture pod, 2025 into Q1 2026 |
| `making-the-app-testable` | Product design | **Live.** Hotels.com app home and results page, read as one argument. Carries the only hard metrics in the portfolio |
| `search-experience` | Product design | **Archived 2026-08-06.** Absorbed into `making-the-app-testable`; its own page keeps the longer version |
| `scaling-a-system` | Design systems | **Rewritten and taken live 2026-08-17, on Wise and Healf only.** The EGDS four-system consolidation, 2021 to 2023. Archived on 2026-08-05 for having no personal role and no reflection, revived once both were written. Still has no cover |

**Nothing is ever deleted from `studies.ts`** — with one exception, taken on 2026-08-17. `wise-placeholder` was deleted, along with its page and both copy entries, precisely because the rule protects a record of real work and there was none in it. It had done its job twice over: it proved the brand field carries a whole entity, and it exposed the hero-count bug below. It is in git history if the scaffolding is ever wanted again. `archived: true` takes a study off the index and out of the next-study rotation; it keeps building and stays reachable at its URL. Which studies make the final cut is a content decision to be made late, and deleting an entry removes the option before then. Reversible by removing one line.

**The section order in `src/layouts/CaseStudy.astro` is the order the questions get asked** — problem, process, interface, impact, hindsight. Slots are named rather than one default slot, so a study cannot quietly ship without its heaviest sections. It is deliberately *not* the structure of the old Expedia page, which was organised around what the system contained and so had nowhere to put rejected explorations, testing trade-offs or hindsight.

**Gaps render as `[NEEDS: …]` on the page**, not as a TODO in a comment. A missing fact that is visible in the browser cannot be lost; one in a comment can. Replace the whole string when the fact arrives. Keys are stable — renaming one orphans the string on the page.

**Two components take a required prop for the same reason `IconButton` requires `aria-label`:** `Metrics` requires `source`, and each `Explorations` item requires `why`. An unattributed number and an unexplained rejected path are the two things a case study says do not pass, so the type system enforces what a convention cannot.

**The vertical rhythm inside a section is three steps**, and each is a stated value rather than whatever margins happened to collapse:

| Between | Gap | Owned by |
|---|---|---|
| Paragraph and paragraph | 20px | `.prose > * + *` |
| A heading and the content it introduces | 40px | `.section-heading` |
| Two blocks that are peers | 64px | `.cs-section` in `CaseStudy.astro` |

It lives on the arrangement rather than as a margin on each component, because a trailing margin on the last block in a section adds space the band has already paid for. Two things it needs that are not obvious: **adjacent margins collapse to the larger**, so the heading's 40px would silently become 64px without an explicit override, and **`.explorations` resets `margin: 0` at equal specificity**, so `.cs-section` is doubled to outrank it — don't "tidy" that away. Every section wrapper must carry `class="cs-section"` or its blocks stack at zero.

## Generated files stay generated

**A pre-commit hook regenerates the specs whenever the things they are measured from change**, and stages the result. `.githooks/pre-commit`, self-installing via `package.json`'s `prepare` script, which sets `core.hooksPath`. It only runs when a `src/components/*.{tsx,css}` or a `design/build*` file is staged, so an ordinary copy commit pays nothing.

**It exists because CI caught what review could not.** `components/specs/*` are measured from component source and stylesheets, so editing a prop or a token makes the spec stale the instant you commit — and a stale generated file is invisible in a diff, because the change you are looking for is the one that never got made. CI's staleness check found it after a push, on 2026-08-07, when a `Parallax` prop change shipped without its spec. A red build you have to come back to is a worse tool than one that never goes red.

It stages rather than aborts. These are generated files with no authorship to preserve, and a hook that blocks a commit to ask you to run a command it could have run itself is friction for its own sake. It prints what it staged, so nothing happens silently.

## Copy

**Every word the site renders lives in `src/copy/*.json`**, in reading order. The `.astro` page is the arrangement; the JSON is the writing. Nothing in a page should hardcode a sentence.

Two reasons it is JSON and not a TS module: a whole page's voice can be read in one file, and the dev editor patches it by path — rewriting a string literal inside TypeScript works right up until two strings are similar.

**In-browser editing, dev only.** `npm run dev`, then `Alt+E` or the pill bottom-left. Anything rendered with `data-copy="<file>:<path>"` becomes editable; blur or Enter writes it back to the JSON, Escape reverts. Components that render strings internally take `copyRef`, `standfirstCopyRef`, `captionCopyRef` or a `copyBase` (which appends `.0.title`).

It **cannot exist in a production build**: `tools/copy-editor.mjs` registers both the Vite middleware and the client script inside `command === 'dev'`. A Vite middleware rather than an API route because this site is static output, which prerenders GET and has nowhere to put a POST. The `data-copy` attributes do remain in the build, inert.

Writes are narrow on purpose — inside `src/copy` only, only replacing a string that already exists at that path, never creating keys; traversal and unknown keys are refused. **There is no undo in the tool. The undo is `git diff src/copy/`,** which is better than anything worth building.

`src/copy` is excluded from Vite's watcher. Saving would otherwise trigger a full reload while you are still working, and the reload buys nothing because the text on screen is the text you just typed. The cost: when the JSON changes from *outside* the browser, refresh to see it.

**`alt` text is not editable in the browser** — it is an attribute, not a text node. It lives in the same JSON and is edited there.

### Bulk editing, when the browser is too bitty

A field at a time is the wrong instrument for rewriting a whole case study — you cannot judge a voice you are seeing one string of at a time. So the same copy round-trips through one markdown document per page:

```bash
npm run copy:export                     # all pages -> copy-drafts/<page>.md
npm run copy:export making-the-app-testable   # or just one
npm run copy:import -- --dry            # show what would change
npm run copy:import                     # write it back
```

**The format is prose with an HTML comment above each string carrying its JSON path**, and that comment is the marker the importer reads — so the round trip is exact rather than a fuzzy match on similar-looking sentences, which is the same reason copy is JSON and not a TS module. Rendered as markdown the comments disappear; in an editor they read as quiet labels. Hard-wrapping is free: lines under one marker are rejoined into a single paragraph.

`copy-drafts/` is **gitignored**. It is a working surface, and a committed draft alongside the JSON would be two sources of truth for the same sentence. The undo is still `git diff src/copy/`.

**The importer's marker regex had no hyphen in it, and `studies.json` was uneditable through the round trip for as long as it has existed.** Markers there are keyed by case-study slug — `machine-readable-components.title` — and `[A-Za-z0-9_.]+` matches none of them. The export wrote all 16 correctly and the import recognised zero, so the file reported "0 markers, 0 changed" and wrote nothing. Nothing refused, nothing warned; the only symptom was a count of zero beside a file that plainly has content. Fixed 2026-08-10. It is the same class of failure as the stale-draft case below, and it is the reason that one is checked so loudly.

**A draft older than its JSON is skipped**, because that case is silent: every string in it parses, matches a real key and writes — it just writes the version from before the JSON was edited. It bit on 2026-08-06, when a draft exported before a simplification would have reverted 25 strings, and only surfaced because one deleted key happened to refuse. Re-export, or pass `--force` if the draft really is the version you want.

**Edge whitespace is carried over from the value being replaced, not taken from the document.** A few strings are deliberate fragments that join around an emphasised span — `process.principle.before` ends in a space, `.after` begins with one — and markdown cannot show that. Trimming them rendered two words fused together in the one paragraph on the page with emphasis in it.

The importer **refuses rather than guesses**, and reports what it refused while still writing everything else — one bad marker should not cost an afternoon of edits. It refuses a path that does not already exist (a typo'd marker is a typo, not a new key), a path whose current value is not a string, and **an empty value over a non-empty one** — the same guard the browser editor has, for the same reason: a blank paragraph reads as a layout gap rather than as data loss, so nothing on the page reports it.

**`how-this-was-built` moved into `src/copy/` on 2026-08-06** to make this work — it had been hardcoding its prose in the `.astro`, against the rule at the top of this section. Its build-time numbers cannot live in JSON, so the copy carries `{braced}` placeholders that the page substitutes. **Edit the words around them; keep the braces.** A placeholder with no matching value is left visible on the page rather than blanked, so a typo shows up as `{primitves}` instead of as a plausible-looking gap. Its facts block is deliberately *not* browser-editable: the rendered string has had its numbers substituted, and writing that back would bake today's counts into the copy and stop the page recomputing.

`src/data/studies.ts` keeps only **structure** — slug, cover image, archived — and reads its strings from `src/copy/studies.json`, keyed by the same slug. One file rather than per-study because the same tile renders twice, on the index and as the next-study link at the foot of the other study; edit it in either place and both change.

**Links containing editable copy get parked while editing.** A tile's title is an anchor and the whole tile is click-through via a stretched pseudo element on it, so in edit mode clicking to place a cursor would navigate. The client moves the `href` to `data-copy-href` and turns off pointer events on that anchor's pseudo elements — removing the href alone stops the navigation but leaves the overlay swallowing clicks on the summary.

Not moved: `src/data/cv.ts`, already a single readable file carrying structure the copy files do not.

## Favicon

**Generated, never drawn** — `design/build-favicon.mjs` reads the same `MARK_PATHS` the `Logo` component renders and the same `semantic.fg.primary` from `tokens.json`, so it cannot drift from the brand mark the way a hand-traced copy would. Part of `npm run specs`, and `public/` is in CI's staleness check, so changing the logo and forgetting the favicon fails the build.

The one thing it hardcodes is colour, and it resolves it from the token rather than typing it: a favicon is fetched outside the page, so it has no stylesheet and cannot use `var(--semantic-*)`.

`favicon.svg` carries its own `prefers-color-scheme` rule. That matters more here than anywhere on the site — a favicon sits on the browser's **tab strip**, not on the page background, so a dark mark disappears into a dark tab. The PNG fallbacks can't flip and take the light fill.

`public/` exists only for these files. It was briefly empty after the hero moved to `src/assets/`, and an empty directory holds no tracked files — git prunes it on checkout, so it vanished from fresh clones and `build-storybook` failed on its missing `staticDirs` entry everywhere but the machine with the stale folder. If it ever empties again, drop the `staticDirs` line with it rather than committing a `.gitkeep`.

## Social and structured data

**Generated, never drawn — same rule as the favicon.** `design/build-og-image.mjs` reads `LOCKUP_PATHS` and the same `band/base` and `fg/primary` the page renders, and emits `public/og.png` at 1200x630. Part of `npm run specs`, and `public/` is in CI's staleness check, so changing the logo and forgetting the card fails the build.

Light only, deliberately: a social card is composited onto whatever surface the reader's client uses and cannot respond to their theme, so it takes the light-mode pair that survives being dropped onto a white message list. PNG rather than SVG because Slack, LinkedIn, iMessage and WhatsApp all refuse SVG for `og:image`.

`Base.astro` renders OpenGraph, Twitter card and JSON-LD on all 9 pages. **This is not in tension with `noindex`**: `og:*` is read by link previewers to draw a card, `noindex` is read by search engines to stay out of an index, and a card in a DM is not a listing. It matters because there is exactly one way this URL travels — pasted into a message to a named person — and without it that paste renders as a bare address.

**`robots.txt` is the one thing that does gate this.** It carries `Disallow: /` for every user agent, and the compliant unfurlers (Slack, Twitter, LinkedIn) honour it, so they will not fetch the page and will never read the tags. The tags are correct and ready; whether to add an allow-list for those specific bots is a decision about the `x` lockup and Revolut's assets, not a technical one, and it has not been made.

**The meta tags are brand-neutral and have to be**, because they are read out of the HTML by a crawler that never runs the script deciding which brand a hostname shows. **The card image is not**: `og:image` is one build-time URL and cannot vary per host, so `/og.png` is the Revolut lockup on the Wise hostname too. Contained rather than solved — `robots.txt` means the compliant unfurlers never fetch it — and the real fix is generating the card per brand, which belongs with the brand-pack split rather than a bodge in `Base.astro`.

Structured data is `WebSite` on ordinary pages and `Article` on a case study, with `articleSection` carrying the discipline from `studies.ts`. Deliberately modest — schema.org rewards inventing properties you cannot support, and every value emitted is already on the page in words. `socialTitle` exists so `og:title` and the Article `headline` carry the page's own name without the `· Rohit Sehmi` suffix that `<title>` needs.

## Analytics

**Vercel Web Analytics, cookieless, so there is no consent banner.** That is the whole reason it is this and not GA4: a cookie dialog would be the first thing a reader interacts with on a site whose argument is interface judgement. `<Analytics />` sits in `Base.astro`, so all 9 pages report. It no-ops until Web Analytics is enabled on the Vercel project, and logs to the console instead of sending in development.

**Two custom events, because page views answer the wrong questions.** Views tell you someone opened a page; they do not tell you whether anyone reached the end of a case study or opened the artefacts it points at, which are the only two things worth knowing here.

- `receipt_open` — `{ artefact, brand }`, from `[data-receipt]` on the three links on `/how-this-was-built`. One delegated listener on the document, so it survives the list changing length.
- `study_read` — `{ study, brand }`, when the impact section has been on screen for **three seconds**, not on first intersection. Scrolling past something is not reading it, and a fire-on-touch event reports a fast scroll to the footer as a full read. Impact rather than hindsight, because hindsight is the last block before the footer and anyone reaching the bottom passes through it.

**`brand` is read off `[data-brand]` in the DOM, never re-derived from the hostname** — see § Brands. One deployment answers every host, so without it "12 people read the product study" could not be split between the sites it was read on.

**`src/components/analytics.ts` is a `.ts`, not a `.tsx`, and that is load-bearing** — same reason as `service-marks.ts`. The component count on `/how-this-was-built` is computed by counting `.tsx` files and `build-code-specs.mjs` writes a contract for each one. Analytics is plumbing, not a component, and must move neither number.

The read-depth slug is read from `data-read-depth` in the DOM rather than passed in, because an Astro `<script>` has no access to frontmatter and `define:vars` would force it inline instead of letting it bundle.

**At this traffic, "aggregate" is effectively individual.** The site is `noindex` and unlisted and goes to a handful of named people, so these numbers identify readers in practice. That is a reason to keep the event list this short, not to add to it.

## Service marks

`/how-this-was-built` links out to Figma, Chromatic and GitHub, and each link carries that service's mark. **Generated, never drawn** — `design/build-service-marks.mjs` fetches them from Simple Icons (path data CC0) into `src/components/service-marks.ts`. A hand-traced logo is a wrong logo, and someone else's mark is the one place "close enough" is a real problem.

**They are deliberately not `Icon` and not in `icons/specs`.** `Icon` is contracted as real Revolut assets taken verbatim from `assets.revolut.com`, with a Figma component set and a checksum behind it; three third-party logos in there would make all three statements false. The file is a **`.ts`, not a `.tsx`**, for a second reason: the component count on `/how-this-was-built` is computed by counting `.tsx` files and `build-code-specs.mjs` writes a contract for each one. A brand mark is an asset, not a component, and must move neither number.

Rendered `fill: currentColor` at `fg/secondary`, not in brand colours — three saturated logos fight each other, and GitHub's near-black vanishes on an inverse band. The marks are `aria-hidden`: the link beside each already names the service.

Not part of `npm run specs` — it needs the network, and these change roughly never.

## Images

**Images go in `src/assets/`, not `public/`.** `public/` is copied byte for byte; `src/assets/` goes through the build, so `getImage()` emits WebP at each width with hashed, immutably cacheable filenames. The hero was a 7.6MB 3840×2400 PNG served as-is and is the LCP element; it is now six WebP widths from 16kB to 265kB, and a typical desktop pulls 137kB.

`Parallax` stays a plain React component so Storybook and Chromatic treat it like any other, which means it cannot import Astro's image pipeline. The page calls `getImage()` and passes `srcSet` and `sizes` down. Storybook imports the same file with Vite's **`?url` suffix** — a bare `.png` import is typed `ImageMetadata` by Astro but resolves to a URL string under plain Vite, and the suffix makes both agree.

**Never pass the source image's `width`/`height` into rendered output.** Referencing `heroSource.width` is what pulls the unoptimised 7.6MB original into `dist/`; drop it and Astro prunes the original. It buys nothing here anyway — `.parallax__image-layer` is `position: absolute`, so intrinsic size cannot move anything.

Storybook still ships the full-size PNG, deliberately: the scrim-contrast stories need the real image, and Chromatic is access-controlled and not a performance surface.

## Storybook and Chromatic

Storybook is the component workshop; Chromatic is visual regression on top of it. Chromatic project `6a70c473fc9430ebb1214df6`.

Every story renders **inside a band**, and the toolbar switches the band role — so the zero-override property is checked the same way it is asserted in Figma. Chromatic snapshots each story light *and* dark, so a regression in either mode fails.

```bash
npm run storybook     # dev
npm run chromatic     # publish a build (needs CHROMATIC_PROJECT_TOKEN)
```

**Public as of 2026-08-07**, alongside the repo. 58 stories across 21 components, both themes.

**Link the branch permalink, `https://main--<appId>.chromatic.com`, not `chromatic.com/library?appId=`.** The library is the build history and sits behind a login, so it reads as a closed door to anyone without an account; the permalink is the Storybook itself and needs none. Per-build URLs are worse again — they go stale.

**What being public costs:** it carries Revolut's real icon assets and, in the lockup, their wordmark. Shared with a named person that reads as close study; on an open URL it is their trademark on an artefact that is not theirs. That is the same unsettled question as the `×` lockup, and it is now live on two URLs rather than none.

**The project token was rotated on 2026-08-13** and both copies — `.env` and the GitHub Actions secret — were updated together. It had been exposed in a chat transcript on 2026-08-03; the record above for why a write credential on a public project matters still stands.

**Rotating it in one place and not the other is the failure mode to watch.** That is what happened between the 7th and the 13th: the value moved on Chromatic's side, `.env` and the Actions secret kept the old one, and the visual-regression job failed on every run while the design-system job stayed green. Nothing said "your token is stale" — CI reported a red build, and the workflow treats an *absent* token as skip-with-a-warning, so the failure looked like a Chromatic problem rather than a credential one.

Build URLs are per-build. Anything you send out should use the project permalink, not the URL a run prints.

## Banding

`docs/banding-system.md` — band roles, foreground inheritance, adjacency rules, vertical scale, measure. Built on Figma page **Banding** (5 sections).

Bands are **relative, not absolute**: a band declares a tonal role and the mode resolves it. Hardcoding `#ffffff`/`#f7f7f7`/`#000000` would break dark mode.

**Four roles, two variables.** `inverse` and `inverse-raised` are `band/base` and `band/sunken` *under an inverted mode* — not separate fills. An inverse band is the same band in the other theme.

**A band owns the foreground of everything inside it.** In Figma that's `setExplicitVariableModeForCollection` on the band frame — it cascades to grandchildren, so an instance dropped into an inverse band flips at **zero overrides** (asserted in section 03). In CSS it's one attribute re-declaring the custom properties. Caveat: CSS redeclaration is *relative*, Figma's override is *absolute*, so Figma bands must be re-pointed when the same layout is shown in the other theme.

Don't reach for `bg/inverse` when you mean a band — it's `#191c1f`, the app surface, not band black.

**Bands are relative. Media is absolute.** `inverse` means *this band in the other theme*, so it flips when the theme flips. That is right for a band whose fill is a token and wrong over a photograph, which does not change with the theme: the foreground would go white in light mode and dark in dark mode over the same image, and `bg/scrim` would weaken from 70% to 40% at the same moment. Content over media carries **`data-on-media`** instead, which `tokens/css.mjs` emits last and unconditionally. Recorded in the Figma spec as its own `media` key, deliberately not in `rules[]`: it is not an adjacency constraint, and the band linter demands an implementation for every rule id it finds there. Used by `Parallax` and by `Nav onMedia` while it is transparent over the hero.

**Absolute is not the same as dark — added 2026-08-05.** The first version of the rule emitted the dark-mode values and stopped there, which quietly assumed every image is a dark photograph. A pale image needs the light-mode values emitted just as unconditionally, so there are two tonalities: `data-on-media` (dark, the default) and `data-on-media="light"`. `Parallax` takes `tone`, `Nav` takes `onMedia="light"`, and the two must agree — they are reading one property of one image, and nothing but a person looking at the picture can tell them what it is.

Getting it wrong is not a visible bug, which is why it needs a prop rather than a convention: a pale image treated as dark still *passes AA*. It just needs a scrim heavy enough to destroy it. Measured on the current hero — white text needs the full 70% black (60% fails the standfirst at 3.93:1), and at 70% an airy composition reads as a grey wash. Dark text on the same image unscrimmed is 14.75:1 median.

**A scrimless hero moves the contrast burden onto the picture**, so two things stop being cosmetic:

- **`object-position`.** Full-bleed plus `cover` crops hard on the horizontal as the viewport narrows — at 390px the current hero keeps about a third of its width. Centred, that third was the busiest part of the image and **33% of glyph pixels failed AA at 390px while the same page passed comfortably at 1440px**. `objectPosition="left center"` fixed it and changed nothing above 1440, where there is no horizontal crop at all.
- **Measure and colour.** The homepage standfirst runs at 32ch, not 52ch, and takes `fg/primary` rather than `fg/secondary`. `fg/secondary` is `#717173` here, a grey built for 4.87:1 on *pure white*; over this image it fails 100% of its glyph pixels at every width. At 52ch the line leaves the plain wall and 12.4% fail even at `fg/primary`; 32ch is the first clean width.

**`design/measure-media-contrast.mjs` is the check.** Everything else in `design/` verifies that a value came from a token; none of it can tell you whether type is legible on a photograph, because that is a property of the picture. Run it against a preview server after changing a hero image. Two traps it avoids, both of which flatter the result: measuring a text node's *bounding box* scores the gaps between words and the ragged right edge of a heading, and measuring one frame misses the drift moving the image under the type. It builds a real glyph mask instead — render the text forced white, then forced black, over an identical backdrop, so `a = (W − B) / 255` exactly — and samples across the scroll range. Deliberately **not** in `verify`: it needs a preview server and a real browser.

**The Figma spec was updated to match, 2026-08-05** — in Figma, via `design/banding-media-update.snippet.js`, then re-exported, because `banding-export.json` is measured rather than authored and hand-editing it would make the file agree with the code while disagreeing with its own source. The `media` key now carries both tonalities and the contrast note. Banding checksum moved `611136477` → `2143010685`.

**The spec is machine-readable**: `page.getSharedPluginData('banding', 'spec')` returns the whole rule set as JSON, and every band node carries `getPluginData('band')` → `{role, scale}`. A page built from bands can be linted against the adjacency rules rather than checked by eye.

**The reasoning is on canvas too.** Section `00 · The system` renders the explanation from `docs/banding-system.md` in Figma, so the page is self-explaining without the repo open. Its role-table swatches are live — bound to `band/base` / `band/sunken` under explicit mode overrides — so "four roles, two variables" demonstrates itself instead of being claimed.

## Skills

Two project skills in `.claude/skills/`, deliberately non-overlapping:

- **`emil-design-eng`** — motion and interaction craft (Emil Kowalski's design engineering philosophy). Easing, durations, press feedback, transform-origin, interruptibility, reduced motion. Carries a "Project overrides" section: no shadows in site chrome, motion values bind to tokens, everything resolves inside an `inverse` band.
- **`anti-slop`** — layout, content, and copy discipline. The tells that make a page read as AI-generated: eyebrows on every section, fake div screenshots, scroll cues, decorative dots, section-number labels, hairline spec tables, filler copy. Ends in a pre-ship checklist.

`anti-slop` is trimmed from a general `design-taste-frontend` skill. Three of its rules were **removed, not softened**, because they contradicted settled decisions: the one-theme-per-page lock (kills the banding system), the ban on Inter (Inter is settled, and matches Revolut), and the anti-derivative aesthetic test (the Revolut match is deliberate). Its opening section lists what it may not re-open.

A third skill, `impeccable`, was evaluated and rejected: it's the frontmatter of an npm-packaged skill, with unresolved `{{scripts_path}}` placeholders and ~10 missing `reference/*.md` and `scripts/*.mjs` files it calls mandatory. It would fail on first invocation.

## Next up

**The system, the site and the multi-brand pipeline are all finished; content is what moves the needle.** 9 pages, 21 components, every check green, no gaps rendering on any live page, two brands live.

1. **Copy across both brands.** The last content job, and the only one that changes what a reader thinks. The per-brand override mechanism exists for anything naming a company — write it through the markdown round trip, not a field at a time.
2. **Every subdomain of `deesyn.com` serves this build.** `*.deesyn.com` is attached to the Vercel project, so `revolut.deesyn.com` is live — and so is any name someone guesses. Decide whether unmatched hosts should redirect to the apex before a company subdomain is shared with anyone.
3. **`og.png` is the Revolut card on every host.** See § Social and structured data — contained by `robots.txt`, not solved.
4. ~~Two provenance questions on the exploration imagery.~~ **Both closed 2026-08-17, by reading the files rather than by reasoning about them.**

   - **The Hotels.com half was a false alarm.** Eight of the eleven `hcom-*` compositions were opened. They are genuine captures of the shipped app, and every number on them is ordinary in-product content — prices, review scores, photo counts, and the app's own marketing copy ("81% booked for your travel dates", "Save 50%"). There are no per-variant test percentages overlaid on any of them. The note claiming otherwise was written from memory and was wrong.
   - **The four EGDS `nca-*` panels are reconstructions, and stay as they are — settled, do not re-open.** The decision record they depict was a real artefact, kept outside Figma; the panel is an illustration of it. The images rebuild Figma's chrome closely enough to read as captures, and the "Decisions" tab in them is not a Figma feature, so the cost was raised and accepted: the underlying decisions are real work, and the artwork carries them better than a redrawn block would.

   **What that leaves as a standing hazard, and it is the transferable part:** `design/usage-rules.json` says "Never fake a product UI out of rectangles. Use a real screenshot or nothing", and `anti-slop` repeats it. These are PNGs rather than divs, so the rule's mechanism does not catch them — and **nothing in `verify` can**, because every check here reads text or tokens and this is a claim baked into a picture. Artwork provenance is checked by a person opening the file, or it is not checked.
5. **No README, so GitHub opens on a bare file tree** with a 70KB `CLAUDE.md` one click away that names Revolut throughout. A README would control the first impression and make this file read as the working record it is. **Do not sanitise `CLAUDE.md`** — it is the technical record and most of the reason the repo is worth linking.

**Smaller, none blocking:** the Storybook's `Marks/Logo` stories show the Ro × Revolut lockup only, and a brand toolbar alongside the existing theme one would make that a demonstration rather than something to hide; `/cv` copy is not wired into the browser editor (it still reads `src/data/cv.ts`); the hero and both index covers are still stand-in imagery. `/about` stays unlinked deliberately — the reasoning is at the top of `src/data/nav.ts`, and one entry brings it back.

**Settle the `×` lockup.** An `×` lockup conventionally reads as a partnership, which would imply an engagement that does not exist. Shared directly with a person it is fine; on an open URL it is not. The same question governs making the Storybook public, and it is now asked twice — Ro × Revolut and Ro × Wise, on two hostnames.
