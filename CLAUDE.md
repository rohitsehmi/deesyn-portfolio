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

**The Chromatic project token is a write credential**, and this repo is public. It lives in `.env` (gitignored) and a GitHub Actions secret — never in a tracked file, never on a command line, because shell history is a file too. `.env.example` documents it. Rotated 2026-08-07.

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

File **"Revolut"** — `UnybX8G5sQIEhLLZN2YFl6`. Pages, and the repo folder each mirrors:

| Page | Repo | Holds |
|---|---|---|
| **Foundations — Revolut** | `tokens/` | 246 tokens, 23 text styles, specimens |
| **Banding** | `docs/banding-system.md` | `Layout/Band` + adjacency rules |
| **Icons** | `icons/` | the icon set |
| **Marks** | `marks/` | brand marks |
| **Components** | `components/` | the 10 UI components |

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

`https://github.com/rohitsehmi/revolut-case-studies` — **public as of 2026-08-07.**

It was private up to that point, and going public set one standing rule: **the repo is read by the same people who read the site.** Working notes about what a page is weak at, or what a claim is inferred from, belong in a conversation and not in a tracked file. The technical record — why a token is shaped a certain way, why a check exists, what broke and how it was caught — is the part worth publishing, and it is most of what is here.

The design system reconstructs Revolut's public brand values under their name, from their live CSS, as a study. See `docs/revolut-design-foundations.md`.

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

**Resolved 2026-08-04.** The chrome used to present Revolut's wordmark alone, which read as claiming their identity. It now uses the lockup, which reads as work made *for* Revolut rather than by them.

**Still open, and it matters more now the repo is public:** an `×` lockup conventionally signals a partnership. Sent directly to someone as a piece of work it is exactly right; sitting on an open URL it implies an engagement that does not exist. The site itself is `noindex` (`public/robots.txt` and the `X-Robots-Tag` header in `vercel.json`), which contains the problem without solving it.

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

**Deprecating a component:** set `setSharedPluginData('spec', 'status', 'deprecated')` on the set in Figma and rename it out of the live namespace. It stays in the file and leaves the published contract; the export lists it under `deprecated` and `verify.mjs` prints it, so its absence is recorded rather than silent. `Deprecated/Brand Logo` (was `XX · Brand/Logo`) is the first.

`design/verify.mjs` **cross-checks every token against `tokens/tokens.json` and exits non-zero if one is missing**, so the two systems cannot drift apart silently. It also asserts zero literals, and prints a checksum that `design/figma-export.snippet.js` reproduces from inside Figma: `2596963867`, 132 entries, matched 2026-08-05. See `design/README.md`. (An earlier `1567749477` was recorded here against the same entry count and was stale — **re-read a checksum from `verify.mjs` rather than trusting this file**, which is the only reason these are written down at all.)

**Three checksums, three sources.** Tokens `4115829316`. Figma components `2596963867`. Banding spec `2143010685`, reproduced from inside Figma by `design/banding-export.snippet.js` (matched 2026-08-05). Code-only specs print `2834059722` but have no Figma counterpart to match, by definition.

**Six components exist only in code**, with no Figma set: `Content/Section Heading`, `Prose`, `Metrics`, `Explorations`, `Hindsight`, `Contribution`. Their contracts are things a variant cannot express, so building them in Figma would document them *less* precisely. `design/build-code-specs.mjs` measures them from source instead: props from the TypeScript declarations, tokens from their own stylesheets, don'ts from `usage-rules.json` like every other component. 17 React components, 17 specs.

`design/verify-css.mjs` covers what was written by hand rather than measured off Figma: **every `var(--*)` in `src/` must resolve against `tokens.json`**, and every font value must bind to `var(--type-*)`. A typo'd custom property is not a CSS error, it renders as an inherited default and looks deliberate, and nothing else in the repo catches it.

`design/verify-bands.mjs` reads its rules from `design/banding-export.json`, measured off the Figma page rather than transcribed. **Every rule id in the spec must have a check or an explicit "covered elsewhere" declaration**, so adding a rule in Figma fails the build until someone implements it.

**`npm run typecheck` is part of `verify`, added 2026-08-05, because nothing else in the repo read TypeScript.** `astro build` transpiles without checking and Storybook renders a story whose props no longer exist rather than failing — which is how three stale `band="inverse"` props on `Parallax` survived the change that removed the prop, and five stories sat un-typechecked besides. `tsc` covers `.ts`/`.tsx`; it does not read `.astro`, which would need `@astrojs/check`.

**Responsive type steps between two styles on the scale at a breakpoint; it never clamps.** A clamp renders sizes that exist in no design file. The case-study hero runs `display.s -> display.m -> display.l`.

**Measured vs authored, kept apart.** `design/figma-export.json` is read off the nodes — nobody wrote it, so it cannot flatter the system. `design/usage-rules.json` is authored: the failure modes someone would actually hit (ghost is not a primary action; never ship an icon-only button without `aria-label`; never fake a product UI out of rectangles). `build.mjs` merges them into each spec; the files stay separate so it is obvious which is which. Same split in Figma: `getSharedPluginData('spec','contract')` measured, `…'donts'` authored.

**Each component section on canvas carries** its reasoning (rendered from the set's own `description`, one source), its don't-rules, a readable contract table, and an in-context usage example in both a base and an inverse band. The raw contract JSON is deliberately *not* on canvas — a 12,000px JSON wall is documentation theatre. Machines read it from plugin data and the repo.

## Case studies

**Two live, one archived, one retired.** `src/data/studies.ts` is the one list; the index and the next-study link at the foot of each study both read it, so they cannot disagree about what exists.

| Slug | Discipline | State |
|---|---|---|
| `machine-readable-components` | Design systems | **Live.** Expedia's New Component Architecture pod, 2025 into Q1 2026 |
| `contextual-home` | Product design | **Live.** Hotels.com app home screen. Carries the only hard metrics in the portfolio |
| `search-experience` | Product design | **Archived 2026-08-06.** Absorbed into `making-the-app-testable`; its own page keeps the longer version |
| `scaling-a-system` | Design systems | **Archived 2026-08-05.** Two design-system studies was one too many |

**Nothing is ever deleted from `studies.ts`.** `archived: true` takes a study off the index and out of the next-study rotation; it keeps building and stays reachable at its URL. Which studies make the final cut is a content decision to be made late, and deleting an entry removes the option before then. Reversible by removing one line.

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
npm run copy:export contextual-home     # or just one
npm run copy:import -- --dry            # show what would change
npm run copy:import                     # write it back
```

**The format is prose with an HTML comment above each string carrying its JSON path**, and that comment is the marker the importer reads — so the round trip is exact rather than a fuzzy match on similar-looking sentences, which is the same reason copy is JSON and not a TS module. Rendered as markdown the comments disappear; in an editor they read as quiet labels. Hard-wrapping is free: lines under one marker are rejoined into a single paragraph.

`copy-drafts/` is **gitignored**. It is a working surface, and a committed draft alongside the JSON would be two sources of truth for the same sentence. The undo is still `git diff src/copy/`.

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

## Analytics

**Vercel Web Analytics, cookieless, so there is no consent banner.** That is the whole reason it is this and not GA4: a cookie dialog would be the first thing a reader interacts with on a site whose argument is interface judgement. `<Analytics />` sits in `Base.astro`, so all 9 pages report. It no-ops until Web Analytics is enabled on the Vercel project, and logs to the console instead of sending in development.

**Two custom events, because page views answer the wrong questions.** Views tell you someone opened a page; they do not tell you whether anyone reached the end of a case study or opened the artefacts it points at, which are the only two things worth knowing here.

- `receipt_open` — `{ artefact }`, from `[data-receipt]` on the three links on `/how-this-was-built`. One delegated listener on the document, so it survives the list changing length.
- `study_read` — `{ study }`, when the impact section has been on screen for **three seconds**, not on first intersection. Scrolling past something is not reading it, and a fire-on-touch event reports a fast scroll to the footer as a full read. Impact rather than hindsight, because hindsight is the last block before the footer and anyone reaching the bottom passes through it.

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

**Public as of 2026-08-07**, alongside the repo. 54 stories across 20 components, both themes.

**Link the branch permalink, `https://main--<appId>.chromatic.com`, not `chromatic.com/library?appId=`.** The library is the build history and sits behind a login, so it reads as a closed door to anyone without an account; the permalink is the Storybook itself and needs none. Per-build URLs are worse again — they go stale.

**What being public costs:** it carries Revolut's real icon assets and, in the lockup, their wordmark. Shared with a named person that reads as close study; on an open URL it is their trademark on an artefact that is not theirs. That is the same unsettled question as the `×` lockup, and it is now live on two URLs rather than none.

**Rotate the project token now that this is public.** A write credential on a public project lets someone else publish content to a URL being sent to employers. Chromatic → Manage → Configure, then `.env` and the GitHub Actions secret.

Build URLs are per-build. Anything you send out should use the project permalink, not the URL a run prints.

**Outstanding:** the project token was pasted into a chat transcript on 2026-08-03 — rotate it in Chromatic → Manage → Configure, then update `.env` and the GitHub Actions secret.

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

**The system and the site are finished; content is what moves the needle.** 9 pages, 20 components, every check green, no gaps rendering on any live page.

1. **Real screens for the second interface block.** `making-the-app-testable` shows the home across three generations; the three adaptive results layouts have no capture, so that block stays out of the arrangement rather than rendering an empty frame.
2. **Two provenance questions on the exploration imagery.** The Hotels.com comparison graphics carry per-variant percentages that no written source backs; either they are real and belong in the copy with a citation, or they are illustrative and should come off the pictures. Separately, the three EGDS "Decisions" panels are recreations rather than captures.
3. **Rotate the Chromatic project token** — Chromatic → Manage → Configure, then `.env` and the GitHub Actions secret. It is a write credential and it has been handled loosely.
4. **`/about` builds but is linked from nowhere.** One entry in `src/data/nav.ts` brings it back; it was unlinked while it was a stub and has been written since.

**Smaller, none blocking:** `/cv` copy is not wired into the browser editor (it still reads `src/data/cv.ts`); Figma draws `Brand/Logo` at 233×48 in both Chrome sets while code renders 32; the hero and both index covers are still stand-in imagery.

**Settle the `Ro × Revolut` lockup.** An `×` lockup conventionally reads as a partnership, which would imply an engagement that does not exist. Shared directly with a person it is fine; on an open URL it is not. The same question governs making the Storybook public.
