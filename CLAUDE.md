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
npm run verify:all   # THE GATE. Exactly what CI runs. Green here == green build
npm run verify       # the source-only subset of it; no build, so no bands or gaps
npm run verify:bands # band adjacency, linted off built HTML (run after build)
npm run chromatic    # visual regression (needs CHROMATIC_PROJECT_TOKEN)
```

**`npm run verify:all` is the one definition of green, added 2026-08-18**, and `.github/workflows/ci.yml` is now a single step that calls it. Before that the workflow listed each check itself, so the local gate and the CI gate were two hand-maintained lists of the same thing — and they had already diverged: `verify` ran six checks while CI ran those plus the staleness check, a build, the band linter and the gap linter. A clean local run predicted nothing, and the only way to find out was to push and wait. That is precisely the friction `.githooks/pre-commit` argues against in its own comment, sitting one level up from it.

**`vercel.json` sat outside that gate entirely until 2026-08-19, and it cost eight deployments.** `d1cfc70` added a `_comment_rewrites` array to it, in the same prose-beside-data style this repo uses for its own JSON. Vercel's schema is `additionalProperties: false` over 40 named keys, none of them starting with an underscore, so **every deploy from `d1cfc70` to `f3ef37f` failed at config validation** and www.deesyn.com served an eighteen-hour-old build. `$schema` is on the allowed list, which is why the file had validated for weeks and why one more key looked equally harmless.

**Nothing went red, and that is the part worth designing against.** Validation happens before install and before build, so there is no build log carrying the error; CI stayed green on all five commits and `verify:all` stayed green locally, because neither read the file. **The symptom was not a failure but silence** — the site simply kept serving the previous build, which is indistinguishable from nobody having pushed. It was found by asking production what it was serving: `/og-wise.png` 404'd while sitting committed in `public/`.

`design/verify-vercel-config.mjs` is what closed it, and it checks two things rather than one — the second found a live bug the first had been hiding, described under § Social and structured data. **Its allowlist is vendored rather than fetched**, deliberately: a check that needs the network is a check that goes red on a train, and it would put an outage at Vercel between this repo and a green build. Staleness fails safe in the only direction that matters — a key Vercel adds later is refused loudly with the instruction to refresh, while an invented key is caught immediately.

**`vercel.json` is someone else's schema**, and that is the narrower lesson. Explaining a value next to it is right in `tokens.json`, in `usage-rules.json` and in every export under `design/`; it does not carry across the boundary, because JSON has no comments and the reader on the other side is a validator rather than a person.

**`README.md` counts the same checks and cannot compute, so `verify-gates.mjs` checks it too.** The page resolves its number from the gate and cannot go stale; the README is markdown read on GitHub with no build step to substitute into, so it states a number — and it drifted **twice**, saying "Eight checks" while nine ran and still saying eight when eleven ran. Both times a plausible sentence in a file nobody re-reads. The number stays typed and a program checks it, including the bullet count, because a correct total above a short list is the shape the page's own bug took.

**`design/verify-readme.mjs` checks the numbers the README states**, because it cannot compute them: it is markdown read on GitHub with no build step to substitute into. It had drifted **twice** — "Eight checks run on every push" survived Gaps being added, then Provenance and Gates; and it opened by calling the site "two case studies" once three were live. Both read as ordinary sentences, which is why nobody caught them. **It counts the bulleted list as well as the total**, because a right total over a short list is the exact shape of the bug the page itself had.

**`design/verify-claude-md.mjs` does the same for THIS file, added 2026-08-19**, and the case for it is written above in its own history: **three stale checksums** have sat in this document, `1567749477`, `2975374804` and `2397650938`, each recorded as current while the build printed something else. The paragraph in § Contracts telling you to "re-read a checksum from `verify.mjs` rather than trusting this file" is an instruction that only exists because the copy here could not be trusted, and a program does that re-reading now. **Every checksum is read back from the script that prints it, never recomputed** — a second implementation of a hash is the exact drift the rest of `design/` exists to stop, and this repo has already paid once for a duplicated rule in the `endsWith` matcher that let `IconButton` cover for `Button`.

**What it deliberately does not check is the to-do items, which are the ones that actually drifted.** § Next up was stale in **six** places at once on 2026-08-19 — the brand count twice, the host redirect, the README, the Storybook brand toolbar, and the number of hostnames the `×` question is asked on — and in every one of them the body of this file was already correct, so the file disagreed with itself rather than with the repo. But an open item is written to be deleted the day it is done, so a pattern anchored to one fails the build at the moment someone correctly removes it, and **a gate that cries wolf gets skipped wholesale** — the same argument as `git push --no-verify` existing. So it checks the claims that outlive their own subject: the four checksums, and how many brands there are, parsed from `src/data/brands.ts`. Three of the six were that one count failing to move when Healf shipped.

**`design/counts.mjs` is where the counting lives, and that is the point.** The page renders these numbers, the README types them, and the check compares them — and two of those used to count independently, which is the failure this repo keeps producing. `how-this-was-built.astro` imports from it now; the refactor was proven inert by diffing the rendered facts before and after.

**`npm run ci:status` reads GitHub Actions without the CLI.** `gh` is not installed here and neither is Homebrew, so every claim that a build was green was the pre-push hook's word rather than the runner's. **The repo is public, so the Actions API answers unauthenticated** — that is the whole trick, and also the limit: 60 requests an hour, and nothing if the repo is ever made private.

**`design/verify-gates.mjs` guards what collapsing the workflow could not.** Someone can still add a step back into `ci.yml` directly; this fails the build if what the workflow runs and what `verify:all` runs are not the same set. It resolves both through `design/gate.mjs`, which expands `npm run` chains out of `package.json` — so a check added to the script is counted everywhere, by one program, rather than by three lists agreeing. **Every place this repo has kept two lists in step by hand they have drifted**: the contract counts that agreed at 20 and 20 by coincidence, and three separate stale checksums in this file.

**`.githooks/pre-push` runs the full gate and blocks**, which is the deliberate difference from `pre-commit`. `pre-commit` fixes what it can fix by itself and stages the result, because stopping you to ask for a command it could have run is friction for its own sake. Nothing at pre-push is auto-fixable — a failing check is a real disagreement between what you wrote and what the system measures. Escape hatch is `git push --no-verify`, and it exists because a gate with no way past it gets disabled wholesale rather than skipped once.

**`/how-this-was-built` counts the gate now, not the workflow.** It used to count `- name:` steps in the verify job, which was true only while the workflow happened to list one check per step; collapsing to a single step took that count to **1** while eleven checks still ran, and the build refused — the guard catching its own foundation being moved. A step is a unit of CI plumbing, a check is the thing being claimed, and `gateChecks()` returns the latter.

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

The page is called **`Foundations`**, not `Foundations — Revolut`. It was renamed at some point and this file said otherwise until 2026-08-10. The Expedia EGDS template page that used to sit alongside it as reference scaffolding has been deleted; the file is now **Cover**, a divider, then the system — Foundations, Icons, Marks, Components, Banding, **Templates** (added 2026-08-18, see below) — then a second divider, then **Case study imagery** at the bottom. Two dividers, not one: Cover sits above the system and the imagery below it.

**`Case study imagery` is content, not system**, which is why a divider separates it from the design-system pages. It sits at the BOTTOM of the file, below the second divider — this file said "above the divider with Cover" until 2026-08-18, which was never true of the actual page order and is the sort of claim only reading the file settles. 22 frames, 11 compositions each existing as a light/dark pair, named `hcom-<subject>-<variant>-<theme>` so a frame name is the filename it exports to. All carry PNG @2x export settings with no suffix.

Inside a frame the tree is `Backdrop` (`Mesh 1–4`, `Base`) and either `Capture` or `Screens › Screen N › Device › Capture` + `Status bar mask`. **That structure is the export contract:** selecting `Screens` gives the phones on transparency, selecting `Backdrop` gives the plate alone. Exporting a whole frame bakes the backdrop into the picture, which is right for a still and wrong for a gallery — see `Content/Carousel` below.

Connect via the **Figma Console MCP**: Figma desktop → Plugins → Development → **Figma Desktop Bridge** (manifest `~/.figma-console-mcp/plugin/manifest.json`). The plugin window must stay open.

`FIGMA_ACCESS_TOKEN` is **configured and working as of 2026-08-18**, so the REST-backed tools answer: `figma_get_file_data`, the version history, and the images endpoint. It had been set to the literal placeholder `figd_YOUR_TOKEN_HERE` for months, and this file recorded that as "not configured" — which is why every REST call 403'd and why the two paragraphs below described a limit that was really a broken credential. **The same lesson as the Chromatic token: the only proof a credential works is using it.** The plugin-sandbox tools remain the right default for reads and writes, because they see the live document rather than the last saved version:
- `figma_execute` for all reads and writes (plugin sandbox)
- `figma_capture_screenshot` for visuals (plugin `exportAsync`, not REST)

**Image bytes CAN be moved from Figma into the repo, corrected 2026-08-18.** This file said they could not, and that was true only of the plugin bridge: there is no disk cache and a 1448×1086 PNG as base64 is far too large to return, so `exportAsync` bytes genuinely cannot cross and `figma_capture_screenshot` can *show* an image without writing a file. All of that still holds.

What was wrong was the conclusion. **The REST images endpoint renders a node and returns a URL**, which curls straight to disk — `GET /v1/images/:key?ids=<node>&format=png&scale=2`, then fetch the S3 URL it hands back. Verified by pulling `hcom-exploration-gallery-light` at 2896×2172, 2.6MB, and opening it. **The manual `~/Downloads` round trip is no longer necessary for anything that lives in Figma.**

Two things that follow. Artwork made *outside* Figma still has to get in there first, so a generated diagram is unaffected until it is placed in the file. And **provenance now has a second pair of eyes** — `design/asset-provenance.json` says artwork is checked by a person opening the file or not at all, and an agent can now open it too. That does not retire the manifest, which exists to force the claim to be *written*; it means the claim can be corroborated.

There is deliberately **no export script yet**. Nothing outstanding needs one — the remaining diagrams are generated outside Figma — and a path nothing exercises is a path that does not work. It is a short job the day there is an asset to pull.

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
- **The hero's spans are separated by a space, added 2026-08-18, and it is not cosmetic.** `display: none` fixes the accessibility tree and does nothing for anything reading the raw HTML, which sees all three. With no separator the `h1` text content came out fused — `"…for Revolut.Three case studies, for Wise.Three…"`. That matters here more than it would elsewhere: this URL travels one way, pasted to a named person, and increasingly that means pasted into an agent, which fetches the HTML and never runs the stylesheet. One space turns a run-on into three complete sentences. **Not `hidden` with a CSS un-hide** — that means declaring a `display` value on the version that shows, which is the exact shape of the `display: revert` bug. **Not `aria-hidden`** — the HTML is static and cannot know which brand will render it.
- **Two `nav` landmarks share `aria-label="Primary"` and that is fine.** An audit flagged it; the closed panel carries `inert`, which removes its whole subtree from the accessibility tree and the focus order, and the two are never live together — below 768px `.nav__links` is `display: none` while the panel works, and at ≥768px the panel cannot be opened. The `inert` is in the static HTML, so it holds without JavaScript. Recorded because the raw markup invites this false positive repeatedly.
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

**This is isolation by routing, not isolation by build**, and the distinction is the whole risk. Both brands' content is in every page's HTML on every host. That is fine while the brands are different framings of the *same* work and becomes a leak the day they hold different clients' work. `design/paths.mjs` grouping paths into framework / brand pack / content was the first step of the split that would fix it, and **the token half of that split landed on 2026-08-19** — see § Brand packs. **The half that fixes this one did not.** A pack changes what a hostname *looks* like; it does not give a brand its own build, and isolation-by-build is what would stop one brand's content being in another's HTML. Keeping those two apart matters, because the token split is the visible half and it is tempting to read it as the whole thing.

**The Storybook and the repository are the same on every brand, deliberately.** They were briefly pulled from the Wise host on the grounds that they show work made under another brand's name, then reinstated: the shared engineering is what the receipts are *for*, and a reader who follows one is looking at how the site is built rather than at whose logo is in it. Recorded on the page rather than left implicit, including the condition that reverses it. The Figma link is the one receipt that does differ per host.

**Each brand has its own Figma file, and each is a structural copy of the Revolut one.** Revolut `UnybX8G5sQIEhLLZN2YFl6`; Wise `uFjZtr6cIu6JsR3sLpOsYP`; Healf `F0AUIJ19FASx5sUJUTfzGp`. **They stopped being lockup swaps on 2026-08-19** — Wise and Healf now carry their own palette in both the file and the repo, verified equal by checksum. See § Brand packs.

**The Wise and Healf receipts were re-pointed on 2026-08-19** — they had named `G3HBCm7Dsa6gQ2PKv0Y8g4` and `oC393wMf4jcRjm8qbkWTeG`, and both of those keys return **404 from Figma's oEmbed endpoint when called with no session**. Note precisely what that does and does not establish, because the first version of this paragraph got it wrong: **oEmbed 404s for a file that is merely not link-shared exactly as it does for one that is deleted**, so anonymously the two are indistinguishable. What is established is the thing that actually matters for a receipt — **a reader who has never signed in gets nothing** — and not the stronger claim that the files are gone. Nothing in the build reads these keys, which is why it went unnoticed: the only place they appear is the Figma receipt on `/how-this-was-built`, one href per brand in `src/copy/how-this-was-built.json`. **Nothing in `verify:all` can catch this and nothing should try** — a check that resolves an external URL goes red on a train and puts someone else's uptime between this repo and a green build, which is the same reasoning that keeps `verify-vercel-config.mjs`'s allowlist vendored. It is caught by opening the link, and it was caught this time only because a new one was handed over.

**Being structural copies, all three now carry their Cover canvas at the same node, `56:4384`**, so the three receipt hrefs differ only in the file key. **Do not take that as a rule**: the superseded records above had Wise's cover at `56:4387` and Healf's at `11:2960`, and in the current files `11:2960` is the **Marks** page — so swapping a file key while keeping a remembered node id would have landed the reader on the wrong page, looking deliberate. Read the cover id out of the file rather than carrying it over. The lockup geometry recorded elsewhere in this file (224×48 for Wise, 192×48 for Healf, its logotype at `22:4230` path 4) was measured from the superseded files and has **not** been re-verified against these; it is already extracted into `src/components/logo-paths.ts` and the site renders from that, so nothing is broken by it being unconfirmed.

`PARTNER_WORDMARKS` in `src/components/logo-paths.ts` keys the partner logotype by brand. Revolut is deliberately not in it — its logotype is the last entry of `LOCKUP_PATHS`, which is what a client running no JavaScript renders. All of them sit in the same `0 0 233 48` viewBox and share one slot starting at x=84.6, where the `×` glyph ends, fitted to y 8..40. Each logotype is a different width inside that box — Wise runs to 219.51, Healf to 191.18 — and none is rescaled to match; the trailing space simply differs, which at nav sizes is invisible. One `<svg>` per brand would be the alternative and would duplicate the 16kB disc on every page.

**Unmatched hostnames redirect to the apex, added 2026-08-14.** `*.deesyn.com` is attached to the project, so before this every name someone guessed — `healf.deesyn.com`, `monzo.deesyn.com` — served the whole site. `vercel.json` now carries a redirect whose `missing.host` names the four hosts that are real (`deesyn.com`, `www`, `wise`, `revolut`) and sends everything else to `https://www.deesyn.com`. Four things about it that are decisions rather than syntax:

- **A redirect, not a 404.** A 404 confirms the name you guessed was interesting enough to be handled specially; a redirect makes a guessed hostname look like an ordinary wildcard, and it also catches a typo like `wsie.` and lands it somewhere useful.
- **`missing`, not `has`.** "Any host except these" is a negation, and Vercel's host matching is RE2 — no lookaheads — so it cannot be written as a `has` regex. `missing` is the only way to express it.
- **`source` must be `/(.*)`, not `/:path*`** — this is what actually stopped it working, and it took two deploys to find. `/:path*` matched `/cv` and `/anything` but **not `/` and not any path ending in a slash**, and this site serves directory-style URLs, so `/`, `/cv/` and `/how-this-was-built/` — every address a person actually visits — sailed straight through while the rule looked live. The proof was in the same file all along: the `headers` block uses `/(.*)` and has always applied to every page.
- **The host pattern is anchored**, `^(?:(?:www|wise|revolut|healf)\.)?deesyn\.com$|^.+\.vercel\.app$`. Unanchored, `monzo.deesyn.com` *contains* `deesyn.com` and would count as allowed on a substring test. **Whether that was ever actually breaking anything is unproven** — the first diagnosis blamed it, and the redirect was still broken after fixing it, because the `source` was the real fault. Anchored is correct either way; it is recorded here as a belt-and-braces change rather than as a fix that was demonstrated.
- **Diagnosing it needed a non-root path.** Testing `/` alone cannot separate "the host condition never matches" from "the source pattern misses this URL", and both were live hypotheses. `curl` on `/cv` versus `/cv/` split them in one step.
- **`*.vercel.app` is on the allowlist**, and it has to be: without it every preview deployment bounces to production and there is no way to look at a build before promoting it. The cost is that this rule cannot be tested on a preview, which is why the next point matters.
- **`permanent: false` on purpose.** A 308 is cached by the browser and is very hard to take back if the pattern is wrong; a 307 costs one deploy to fix. It stays temporary until it has been checked against every real host in production, and moving it to permanent is a deliberate second step rather than the default.

**What is still Revolut-only on every host:** the tokens, the icon set, and the Storybook's `Marks/Logo` stories. The social card was on this list until 2026-08-19 and is now genuinely per host — see § Social and structured data, including the day it spent recorded as fixed while serving one brand's card to all three.

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

## Brand packs

**A brand pack extends the base collection and replaces nothing, added 2026-08-19.** This is the split `design/paths.mjs` was grouped for, and it is what stopped Wise and Healf being Revolut with a different logotype. One file in `tokens/brands/` adds its own primitives and re-points the same semantic names every component already binds to, so **no component, no band and no stylesheet changed.**

**That claim was proven rather than asserted:** regenerating `tokens.css` with the first pack in place was **348 insertions and 0 deletions**. Revolut's CSS is byte-identical. A pack overrides 35 of the 38 semantic colour tokens; the alphas, the status colours and the durations still resolve to base, which is why a pack is a short file rather than a second design system.

**ONE PACK CAN SERVE SEVERAL BRANDS.** `tokens/brands/portfolio.json` carries `brands: ['wise', 'healf', 'deesyn']`, because Wise and Healf were given identical ramps and three byte-identical pack files would be exactly the hand-maintained duplication every check in `design/` exists to stop. Split it the day they diverge: copy the file and narrow each list. `brand: 'x'` singular is still accepted.

**`deesyn` is declared by that pack and is deliberately NOT in `src/data/brands.ts`.** Nothing emits for it and no hostname serves it; it is kept as a working reference. `tokens/verify-brands.mjs` prints it rather than failing, the same reason `verify.mjs` prints deprecated components — a thing that is deliberately inert has to stay visible or it becomes a surprise to whoever finds it next.

**The hard part is not `:root`, and this is the transferable lesson. A pack has to re-emit EIGHT blocks.** `inverse` bands and `data-on-media` do not reference the semantic layer: they **resolve the other mode's values into a literal list of declarations**. A pack that overrode only `:root` would flip the page and leave every inverse band and every caption over an image still wearing the base brand's palette — on the two surfaces that are hardest to notice and most embarrassing to ship. Specificity is deliberate rather than incidental: `:root[data-brand=x]` (0,2,0) beats `:root` (0,1,0), and light is emitted before dark so a tie inside `prefers-color-scheme` resolves to dark, matching the base blocks.

**`tokens/brands.mjs` is the one implementation.** `tokens/css.mjs` emits from it, `tokens/verify-brands.mjs` checks it, `design/verify-contrast.mjs` resolves through it and `design/build-og-image.mjs` takes its card colours from it. A second resolver written into the contrast check was deleted the same day it was written, which is the `design/counts.mjs` lesson applied before it could cost anything.

**The card is repainted too, and it has to be.** The social card is generated from tokens rather than drawn, so a brand that repoints `fg/primary` and `band/base` repoints them there as well. Miss it and a navy site unfurls a card in the base brand's near-black, on the one surface a reader sees *before* they open the site.

### The checksum, and why it hashes values rather than paths

**`2791783775` across 107 entries, reproduced from inside Wise and inside Healf on 2026-08-19.** `tokens/verify-brands.mjs` prints it; `tokens/brand-export.snippet.js` reproduces it from the live Figma file. This is the first time Figma and the repo have agreed about a brand's colours by measurement rather than by hand.

**It hashes RESOLVED values, never alias paths**, and that is what makes agreement possible at all. Figma has no notion of this repo's JSON paths, so a checksum over the route to a value could never match across the two sides; one over the value that falls out can, and it checks the thing a reader actually sees. Names are lowercased and space-stripped so `Portfolio/Teal/600` and `portfolio.teal.600` reduce to one key.

**`tokens/brand-apply.snippet.js` is GENERATED** by `tokens/build-brand-snippet.mjs` and sits in `GENERATED`, so the staleness check covers it. A plugin sandbox cannot read this repo, so the snippet is unavoidably a second copy of the palette; generating it is what stops that copy being a hand-maintained one.

### Writing to a Figma file, and the target that moves under you

**With several files connected the plugin target DRIFTS.** Between applying to Wise and applying to Healf it silently returned to `Revolut_[multi-brand-test]`, because the lock releases when the pinned file disconnects. A blind write would have put the palette in the wrong document. Three guards, and keep all three: `figma_navigate(lock: true)`, an explicit `fileKey` on the call, and a `figma.root.name !== 'X'` throw at the top of the script.

**Verify a write three ways**, because each catches something the others cannot: the checksum, a spot-check of individual lines (`L|fg/accent|#16625b`, `D|band/base|#0e1728`), and sampling real component nodes' resolved fills — which is the only one that proves the *bindings* are live rather than the variables merely having changed beside them.

**`Revolut_[multi-brand-test]` `XzEJoFtUhzVT8NPJtwEpjR` also carries the palette**, because it is where the script was rehearsed before either real file was touched. That is what the file is for; the undo is Figma version history.

**The Figma write repoints rather than extends, and that asymmetry is worth naming** since the code side genuinely extends. It is defensible because **each brand has its own file, so the file is the brand axis** and Wise's file exists to be Wise. Figma modes would be the alternative, and they do not fit: semantic values vary by theme *and* brand, so one collection needs brand × theme modes — six for three brands, against a cap of four on Figma Professional. Modes would win for a single file demoing every brand, which is a different job.

### Storybook needed no change, and that is the evidence

`.storybook/preview.tsx` already imported the generated `tokens.css` and already set `[data-brand]` on the **root**, which is what `:root[data-brand=x]` keys off. So the brand toolbar went from swapping one logotype to re-theming every story in both modes with no decorator change — the clearest demonstration that the packs sit in the token layer rather than in the components.

**What it does not do is snapshot per brand.** Chromatic renders each story light and dark at the default brand, so a palette regression in Wise or Healf would not fail a build. Adding brand to that matrix triples the snapshot count, so it is an open cost decision rather than an oversight.

## Contrast

**`design/verify-contrast.mjs` measures every foreground and background pair the pages actually use, across every brand and both modes, added 2026-08-19.** 136 pairs, all meeting WCAG AA. Everything else in `design/` asks whether a value came from a token; this asks whether the resulting pair can be read, which is a different question and the only one a reader has an opinion about — a palette can be perfectly tokenised, checksummed and literal-free and still put grey on white at 1.65:1, which this repo has already shipped once in `fg/tertiary`.

**Translucent tokens are composited over the band beneath them**, which is the whole reason this cannot be done by eye: `fg/secondary` in dark mode is white at 70%, and what that resolves to depends entirely on what it is painted on.

**Its first run failed `border/strong` at 1.65:1 in the BASE brand, and the check was wrong rather than the palette.** The reflex is to lighten a value that has shipped for weeks. Reading the code instead: `border/strong` appears exactly once, as `1px dashed` on `Media`'s placeholder, and `border/default` draws rules and dividers. WCAG 1.4.11 covers what is needed to *identify a control*, so neither is in scope and neither is text. **A threshold applied to the wrong thing is worse than no threshold, because it gets satisfied by moving a value that was already right.** There are two tiers now: gated, and measured-but-printed. The decorative and exempt pairs still print on every run, for the same reason the reconstructions do.


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

**`chevron-left` is a real asset as of 2026-08-13**, and the carousel's previous button uses it. It is `chevron-right` mirrored about x=12 as path data, not a transform: Revolut's own `chevron-up` and `chevron-down` are exact vertical mirrors of each other, so mirroring is how this set relates its chevrons and the result is the geometry Revolut would ship. Every vertex was checked against the SVG Figma exports for the node, 11 of 11 in order, and the repo checksum reproduced Figma's at the time (`4180069571`, since moved by the footer change on 2026-08-19).

It replaced a `scaleX(-1)` on the glyph, which worked and had precedent but was the weaker answer for a reason worth keeping: **a CSS flip is invisible to the contract.** The published spec said that button used a right-pointing chevron, because the spec is measured from Figma and Figma had no idea. Anything else that later transformed that glyph would also have had to remember to compose with it.

**`carousel-controls.ts`, not `carousel.ts`.** macOS is case-insensitive, so `./Carousel` resolved to the script rather than the component and the build broke. It is a `.ts` for the same reason as `number-ticker.ts` — it must move neither the component count nor the contract count.

**`Content/Token Tiers` — added 2026-08-19, and it replaced a PNG rather than joining one.** The three-tier diagram under "What shipped" on `scaling-a-system` had shipped as `src/assets/egds-token-tiers-light.png`: a 1.3MB export on a near-white plate, which on a dark page is a lit panel in the middle of an article. That is exactly what `Media`'s `srcDark` exists for, the second export was recorded as outstanding rather than declined, and it never landed. **Drawing it in elements retires the question instead of answering it** — the chrome resolves from the page's own tokens, so it is correct in both themes at every width, it repaints with the brand pack, and there is nothing to download.

**The rule it is built on is the transferable part: what the diagram is MADE of is a token, and what the diagram is ABOUT is data.** Plates, rules, type, connectors and hairlines all come from `semantic.*`, so `TokenTiers.css` contains no colour literal and the contract's own sentence — "Every value is a token reference, not a literal" — stays true. The six greys, the six semantic values and the three brand ramps arrive as inline styles from `src/data/egds-token-tiers.ts`, because **a picture of somebody else's palette that repaints with yours has stopped being true.** Same distinction as bands being relative and media absolute; a depicted ramp is media.

- **The palette was SAMPLED from the PNG, pixel by pixel, not remembered.** That is why the file is retained rather than deleted, and `design/asset-provenance.json` now says so and says it renders on no page.
- **Two tones are `color-mix` against `currentColor`, which is not a colour.** A hairline on the inverse tier has to be light and the same hairline on a pale tier has to be dark, and no token pair says that, because the site has no surface that flips *inside* a band. The tier gloss is the same call for a harder reason: **`fg/secondary` over the tinted plate measures 3.95:1**, under AA, since that token is built for 4.87:1 on pure white and the wash takes the background down with it.
- **The ladder is the argument, not decoration.** Fixed tier solid, shared tier a wash, and the tier each brand has to fill in an empty outline. The artwork already made the point one level down by drawing the feature *swatches* as empty rings.
- **The side-by-side breakpoint is 1040 and it is measured.** The row has to fit the widest gloss and six labels at once: glyph 32, `Raw values, platform agnostic` at 191, `Button Disabled` at 93. That needs 854px of tier, which is precisely what the 920 measure leaves after padding and 120 more than an 800px window has, so below it the tier stacks and the swatches go three across. Measured in the browser rather than estimated — the first two attempts wrapped a label in half, and a broken label reads as a seventh slot.
- **The brand marks are a letter in a disc, and that is a deliberate difference from the artwork.** `design/build-service-marks.mjs` already holds the rule: a hand-traced logo is a wrong logo. Simple Icons carries Expedia and Hotels.com as CC0 path data and does not carry Vrbo, so a faithful set is unavailable and a mixed one would read as an oversight rather than a decision. The disc carries each brand's real accent, which is the information that row exists to give.
- **The depicted button is a `span`, never a `button`.** It is a picture of a control; a real one there is a tab stop that does nothing. The whole figure carries `role="img"` and one `alt`, which is why `alt` is a required prop — a picture built from elements has no missing image for anyone to notice.

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

`design/verify.mjs` **cross-checks every token against `tokens/tokens.json` and exits non-zero if one is missing**, so the two systems cannot drift apart silently. It also asserts zero literals, and prints a checksum that `design/figma-export.snippet.js` reproduces from inside Figma: **`4147464933`**, 133 entries, matched 2026-08-19. See `design/README.md`. (An earlier `1567749477` was recorded here against the same entry count and was stale — **re-read a checksum from `verify.mjs` rather than trusting this file**, which is the only reason these are written down at all.)

### Changing a component means changing it in BOTH places

**A component's structure lives in two files, and nothing checks that they agree.** `verify.mjs` proves every value in a spec is a token and that the repo reproduces its own checksum; it compares the repo to itself. `verify-figma-template.snippet.js` lints templates against the layout spec. **Neither asks whether `Footer.tsx` and `Chrome/Footer` describe the same thing.**

That gap was found on 2026-08-19, by Rohit, after a second link was added to the footer in code and Figma was left behind — in a session whose whole subject was drift. The loop is five steps and skipping any of them leaves the two sides disagreeing silently:

1. change the component in `src/components/`
2. make the matching change to the Figma component set
3. **update the set's `description`** — it is published in the contract, and it is prose, so nothing will ever tell you it is stale
4. re-run `design/figma-export.snippet.js` inside Figma, patch `design/figma-export.json`, `node design/build.mjs`
5. carry the new checksum into this file

**The change that exposed it also proved the code had ALREADY drifted.** Figma right-aligned the footer link with a grow spacer; the code rendered both links adjacent on the left. Nobody noticed until Rohit said he preferred them on the right — which was not a new preference, it was the build disagreeing with the design file. **The drift ran for an unknown length of time and no check could have caught it.**

**Why there is still no automated check.** The export snippet needs `figma.variables` and plugin-only APIs, so it cannot run in CI as-is. REST could now do it — the token works as of 2026-08-18 — but the contract would have to be re-derived from `boundVariables` over REST and kept identical to the plugin version, which is a second implementation of the exact thing this repo keeps proving cannot be kept in step by hand. **Until that is written, this is a discipline, not a gate**, and it is written here because that is most of the enforcement it has.

**The hook says so at the moment it matters, added 2026-08-19.** `.githooks/pre-commit` already fires on a staged `src/components/*.{tsx,css}`, and it was silent on the footer commit for a reason worth stating rather than patching over: its whole job is regenerating stale specs, and a Figma-measured spec does not regenerate from the component — `chrome-footer.json` is read off the set, so nothing went stale and there was nothing to say. It now names the Figma set behind every staged component and points at this section. **It is a notice, not a gate**: it cannot tell a structural change from a copy change, so it prints on both, which is why it is four lines rather than the five-step loop in full. A reminder that recites instructions on every commit is one people learn to scroll past.

**`design/component-specs.mjs` holds the component → spec matcher, and `verify-contracts.mjs` imports it rather than keeping its own.** That matcher has been wrong once already — the `endsWith` test where `Button` matched `action-icon-button` — and a second copy of a rule this repo has got wrong before is the drift every other check in `design/` exists to stop. The refactor was proven inert by diffing the check's own output before and after, the same move as `dist-hash.mjs`.

**Four checksums, four sources.** Tokens `2836674598`. Figma components `4147464933`. Brand packs `2791783775`, reproduced from inside Wise and Healf by `tokens/brand-export.snippet.js` (matched 2026-08-19). Banding spec `2143010685`, reproduced from inside Figma by `design/banding-export.snippet.js` (matched 2026-08-05). Code-only specs print **`324663061`** across 10 components and 324 entries, but have no Figma counterpart to match, by definition.

**That value was recorded here as `2397650938` and was stale, found 2026-08-17** by running `design/build-code-specs.mjs` and comparing. The regenerated specs were byte-identical to the ones committed, so the specs were right and only the number written down was wrong: a component changed at some point, the pre-commit hook regenerated and staged the specs exactly as designed, and nobody carried the new checksum up into this file. **This is the third time a stale checksum has sat in this document**, after `1567749477` and `2975374804`, which is the standing argument for re-reading one from the build rather than trusting the copy here.

**Eleven components exist only in code**, with no Figma set: `Content/Section Heading`, `Prose`, `Metrics`, `Explorations`, `Hindsight`, `Contribution`, `CaseStudyTile`, `Parallax`, `Carousel`, `TokenTiers` and `GovernanceTiers`. Their contracts are things a variant cannot express, so building them in Figma would document them *less* precisely. `design/build-code-specs.mjs` measures them from source instead: props from the TypeScript declarations, tokens from their own stylesheets, don'ts from `usage-rules.json` like every other component. **23 React components, 23 with a published contract** — this file said six and 17/17 until 2026-08-10, when `CaseStudyTile` and `Parallax` had joined the list without it being written down, and said 20/20 until 2026-08-13.

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

**Generated, never drawn — same rule as the favicon.** `design/build-og-image.mjs` reads `LOCKUP_PATHS` and the same `band/base` and `fg/primary` the page renders, and emits one `public/og-<brand>.png` per brand at 1200x630. Part of `npm run specs`, and `public/` is in CI's staleness check, so changing the logo and forgetting the card fails the build.

Light only, deliberately: a social card is composited onto whatever surface the reader's client uses and cannot respond to their theme, so it takes the light-mode pair that survives being dropped onto a white message list. PNG rather than SVG because Slack, LinkedIn, iMessage and WhatsApp all refuse SVG for `og:image`.

`Base.astro` renders OpenGraph, Twitter card and JSON-LD on all 9 pages. **This is not in tension with `noindex`**: `og:*` is read by link previewers to draw a card, `noindex` is read by search engines to stay out of an index, and a card in a DM is not a listing. It matters because there is exactly one way this URL travels — pasted into a message to a named person — and without it that paste renders as a bare address.

**`robots.txt` is the one thing that does gate this.** It carries `Disallow: /` for every user agent, and the compliant unfurlers (Slack, Twitter, LinkedIn) honour it, so they will not fetch the page and will never read the tags. The tags are correct and ready; whether to add an allow-list for those specific bots is a decision about the `x` lockup and Revolut's assets, not a technical one, and it has not been made.

**The meta tags are brand-neutral and have to be**, because they are read out of the HTML by a crawler that never runs the script deciding which brand a hostname shows.

**The card is generated per brand, and an unfurler still gets Revolut's. Contained, not solved.** `build-og-image.mjs` emits one file per brand and **`vercel.json` rewrites `/og.png` per host**, server-side, so it applies to an unfurler exactly as it does to a browser. That part works and was measured: `curl` each host and three distinct files come back, each matching its `public/og-<brand>.png`. **Nothing ever asks for that path on a brand host**, which is the next paragraph.

**A rewrite, not a redirect**: the URL a client asked for is the URL it keeps, and some unfurlers will not follow a redirect for `og:image`.

**This spot said "fixed 2026-08-18" for a day while the feature did nothing at all, because REWRITES ARE MATCHED AFTER THE FILESYSTEM AND REDIRECTS BEFORE IT.** The first version let Revolut keep the bare `og.png` on the reasoning that the default needs no entry, the same rule as `[data-brand]` carrying no attribute. That rule holds in CSS and does not survive the trip to Vercel's router: `public/` is copied byte-for-byte into `dist/`, so a real `dist/og.png` answered every request and not one of the per-host rules ever ran. **Every host served the Revolut card — precisely the state the change was written to end.**

Nothing about it read as broken. The file was right, the rewrite was right, and the ordering that joins them is written down in neither; it also cannot be caught locally, because it is a property of Vercel's router rather than of the build. **Found by asking production what it was serving**: `wise.deesyn.com/og.png` came back sha256-identical to `public/og.png`.

**So there is no bare `og.png` any more.** Every brand gets `og-<brand>.png`, Revolut included, and `/og.png` is a path that exists *only* as a rewrite — three rules, the last carrying no `has`, which is the default. A path no file answers is what makes the rules reachable at all. `design/verify-vercel-config.mjs` now fails the build if a file ever reappears at the source of a rewrite.

**And that spot then said it was fixed for a second time while an unfurler still got the Revolut card — corrected 2026-08-19, the same day, one layer up.** `og:image` must be an **absolute** URL per the OpenGraph spec, `Base.astro` builds it from `site` in `astro.config.mjs`, and one prerendered build has exactly one value for that. So the tag reads `https://www.deesyn.com/og.png` in the HTML of **all four hosts** — checked on each — and an unfurler reading the Wise page fetches www, where the arm with no `has` is the default one. Three per-host rules, all correct, all reachable, **none ever reached**.

**The error was verifying the mechanism and calling it the feature.** `curl https://wise.deesyn.com/og.png` proves the rewrite fires, and no client ever requests that URL. The check that settles it is to read the tag out of the HTML a crawler actually gets and then fetch exactly that — which is the third time in one sequence something was confirmed at the wrong layer, after a file outranking a rule and a config key failing before the build.

**It cannot be fixed in the page**, and that is a property of the architecture rather than an oversight: an absolute URL pins the host before any rewrite is consulted, and one build has one origin. The honest fixes are a build per brand or an edge function rewriting the tag. **The brand-pack split gets this for free** — each build would set its own `site` — so this is an argument for that split rather than a separate problem, and it stays as it is until then.

**What contains it is `robots.txt` plus the `X-Robots-Tag` header**, which stop a compliant unfurler fetching these pages at all, so nothing reads the tag today. That is containment with a date on it: the day an allow-list is added for Slack or LinkedIn, this becomes live and wrong. **`design/verify-vercel-config.mjs` prints it on every run** rather than passing silently — no absolute URL in `dist/**/*.html` may pin a path that a **host-conditional** rewrite claims, and `/og.png` is declared in `ACCEPTED_PINS` there with what contains it. An undeclared pin fails the build. Only host-conditional rules are in scope, because the unconditional arm resolves identically everywhere and is fine to pin; the match is on the URL's pathname rather than a substring, or `/og.png` would also match `/og.png.backup` — the same shape as the `endsWith` trap in `verify-contracts.mjs`.

**The transferable part is bigger than this file: "the default carries no marker" is a pattern this repo uses well in CSS and it does not transfer to a router.** `[data-brand]` absent means the default because the CSS asks about absence. A missing `og.png` rule meant the default because a *file* was standing in for a rule — and a file is not a rule, it is the thing that outranks one.

**Only the last path differs.** The disc, the script and the `x` are shared; `PARTNER_WORDMARKS` holds the partner logotype in the same `0 0 233 48` viewBox, so a brand card is `LOCKUP_PATHS.slice(0, -1)` plus one entry rather than a second lockup.

This stays belt-and-braces while `robots.txt` disallows everything: the compliant unfurlers never fetch the page and so never read the tag. It is done so that the day that changes, the cards are already right.

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

**Public as of 2026-08-07**, alongside the repo. 60 stories across 22 components, both themes.

**A brand toolbar sits beside the theme one, added 2026-08-18**, and it closes the gap that `Marks/Logo` showed the Ro × Revolut lockup only — the one component whose whole job is to differ per brand was the one the workshop could not show differing. Revolut, Wise and Healf, with Revolut the default.

**The decorator sets `[data-brand]` on the ROOT, not on a wrapper, and that is forced rather than tidy.** The default arm in `base.css` is `:root:not([data-brand]) [data-brand-only]:not([data-brand-only~='revolut'])`, which keys off the *absence* of the attribute on the root itself. Put `data-brand="wise"` on a div and that rule still matches, so the Revolut arm hides the Wise logotype at the same moment the Wise arm shows it, and the lockup renders with no partner mark at all. Setting it on the root is also exactly what the live inline script does.

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

### The layout export, and why it exists

**`design/layout-export.json` states the page layout in numbers, added 2026-08-18.** Band padding per scale per breakpoint, the measure, the three vertical steps, which text style every page element resolves to at each breakpoint, and what colour it renders in. Generated by `design/build-layout-export.mjs`, part of `npm run specs`, in `GENERATED` so the staleness check covers it. Rendered on the Banding page as **`06 · Page layout`**, and carried as `getSharedPluginData('layout', 'spec')` on both that section and the page — same pattern as the banding spec beside it.

**It goes on Banding rather than Foundations because `docs/banding-system.md` already declares that banding owns the vertical scale and the measure.** Foundations defines what `display/l` *is*; this says a case-study title *renders* it above 1024. A separate page would split one topic across two places.

**It is parsed from the real stylesheets, not authored**, resolving every `var(--primitive-*)` through the generated `tokens.css`, so it cannot drift from what ships and cannot flatter the system. **It throws rather than emitting a partial spec** — a hole reads as "this element has no opinion" when it means "the parser lost it", and somebody builds to the gap. That fired immediately: `.prose p` is not `.prose > p`, and the refusal is what found it.

**The gap it closes had a cost with a date on it.** On 2026-08-18 a full desktop case-study mock was built in Figma. The band **roles** were right first time because `verify-bands` publishes them; **seven dimensions were wrong** because nothing did — the 768px tier of the responsive scale used instead of the 1024px one, `.measure`'s `max-width` read as the content width when 40px of inline padding comes out of it, and four type steps stopped one step short. The mock looked plausible, which is why it survived being looked at. **The parts of the system that were machine-readable came out right; the parts living only in CSS came out wrong**, and that is the whole argument for this file.

**Two values it publishes that are counter-intuitive and cost real time:**
- **`max-width: 1000` includes the inline padding**, so the column you draw to is **920** at desktop, not 1000.
- **Prose paragraphs render `fg/secondary`, not `fg/primary`**, and a `lead` block's first paragraph steps to `body/xl` at `fg/primary`.

**`ch` is the one thing it cannot resolve for you.** The site caps measures in `ch` and Figma has no such unit, so the export carries the *count* and a Figma build must render the glyph run in the real text style and read the box. The px column on the canvas is that measurement at ≥1024 and moves if the type scale does.

**It got a second half on 2026-08-18, and needing one is the lesson.** With the page chrome published, a Figma template still got three blocks wrong — because publishing the *chrome* only moved the guessing down one level, into the components that sit inside it. Each was wrong in a way that looked deliberate:

- **`Contribution` is a labelled list, not a two-up grid.** A flex column of rows at `minmax(9rem, 14rem) 1fr`, gap 20, baseline-aligned, capped at 72ch. The template had it as a wrapping two-column grid at gap 40 — **with the term and detail styles swapped**, term on `emphasis/3 fg/secondary` when it is `emphasis/1 fg/primary` and detail the other way round.
- **`Hindsight` is an accent-ruled callout that carries its own heading.** `bg/subtle`, a 3px `fg/accent` inline-start rule, 32 padding, r20, 72ch. The template had rendered it as a plain `SectionHeading` plus prose — **and the SectionHeading was itself the bug**, because `Hindsight.tsx` says in as many words that pairing one with it prints the same heading twice.
- **`Metrics` items carry a top rule**, `1px border/default` with 12 above, gap 6, and the value steps to **`display/l`** at ≥1024. The template had no rule and stopped at `display/s`.

**`components/specs/*` already published the token for every one of those properties and it was not enough.** That answers "is this hardcoded", which is a different question from "what does this look like" — a spec saying `gap → primitive.space.sp600` does not tell you the thing is a two-column list. The export now carries structure, type, colour and measure for `contribution`, `hindsight`, `metrics` and `explorations`, and its `raw` values name their tokens (`3px solid fg/accent`) rather than leaking `var(--semantic-fg-accent)`, because one is buildable in Figma and the other is not.

### The `Templates` page, added 2026-08-18

**A ninth page in the Figma file, after Banding**, holding `01 · Case study — desktop`: a 1440 build of `machine-readable-components` at the values the layout export publishes, for a designer to duplicate rather than rebuild. It is a composition rather than a system definition, which is why it is its own page and not a section on Banding.

**It uses real component instances wherever Figma allows one** — 17 of them, drawing on `Chrome/Nav`, `Chrome/Footer`, `Content/Tag`, `Content/Media`, and through those, nested `Brand/Logo`, `Action/Button`, `Action/Arrow Link` and `Icon`.

**Bands are frames, and that is forced rather than chosen.** `Layout/Band` has no SLOT property, and a Figma instance cannot take new children, so a band instance physically cannot hold page content. The frames carry the same bound variables, the same padding, and the same `getPluginData('band')` the linter reads — which is also what the live site does, since `Band.tsx` renders a `div`. **Giving `Layout/Band` a content SLOT would make it usable in a composition for the first time**, and is the single change that would let this template be instances end to end.

**`Chrome/Footer` at `scale=compact` IS the closing `base/compact` band** — 1440×196 is 80 padding twice plus 36 of content. The template's own plugin data therefore reads seven bands, not eight; the eighth is inside the component.

### The template linter, and the third round of the same mistake

**`design/verify-figma-template.snippet.js` lints a Figma template against the published spec**, reading it from the Banding page's plugin data rather than embedding a second copy. Run it in Figma; it is the counterpart to `verify-bands.mjs`, which lints the built HTML. **Not in `npm run verify` and it cannot be** — it reads a live document over the plugin bridge, and there is no REST token.

**It exists because building a template by hand produced the same class of failure three times, each invisible in a screenshot.** Publishing one layer only moved the guessing to the layer below it:

1. Band padding, the measure and four type steps taken from the **768px tier instead of the 1024px one**. Fixed by publishing `layout-export.json`.
2. `Contribution`, `Hindsight` and `Metrics` built from inference, because publishing the page *chrome* said nothing about the blocks inside it. Fixed by extending that export to components.
3. **Every section one band out of place.** The roles ran in the correct legal sequence the whole way — `verify-bands` would have passed it — while the inverse band showed `interface` instead of `impact`.

**The third is the one that argues for all of this. A sequence is not an assignment.** `layout-export.json` now carries `page.caseStudy`, parsed from `CaseStudy.astro`, stating which section sits in which band. Two that catch people: **the contribution list is inside the hero band**, and **the inverse band is impact**.

**The nav is chrome, not a band.** It sits above the first band and carries no band plugin data, so the linter filters it out before comparing positions — without that, every band reads one place out and the checker invents eight failures.

### Editing copy in Figma, and pushing it to a build

**Yes, and it is the same mechanism as the other two routes rather than a new one.** Every text node in a template carries `setPluginData('copy', '<file>:<path>')` — the identical string `data-copy` carries on the live page — so a node maps to exactly one JSON key rather than to whichever string looks most similar.

```bash
# 1. in Figma: run design/figma-copy-export.snippet.js, save the JSON
node design/figma-copy-import.mjs <file.json> --dry   # show what would change
node design/figma-copy-import.mjs <file.json>         # write it back
```

**Three routes into the same words, each right for a different job.** The browser editor is for one sentence, the markdown round trip is for rewriting a whole page's voice, and this is for the case both are bad at: **editing copy while looking at it set** — at the real measure, in the real type, with the images beside it. A sentence that is fine in isolation can still be three words too long for the column it lands in, and nothing but seeing it typeset will tell you.

**The guards are `copy-import.mjs`'s, deliberately, because the failure modes are identical**: a path that does not already exist is refused, a non-string target is refused, **an empty value over a non-empty one is refused**, and edge whitespace is carried from the JSON rather than taken from Figma — a text node cannot show a trailing space, and a few strings are fragments that join around an emphasised span. It refuses rather than guesses and still writes everything else. Verified by running it against three real references and three broken ones, and watching it accept the first three and name all three faults.

**A node with no reference is skipped, never guessed at.** Reading time and the "Next" label are computed or structural; writing them back would bake a derived value into the copy, which is the trap the hero count and the facts block both avoid.

### Two more the template got wrong, both fixed 2026-08-18

**The next-study tile carries no image, and the placeholder I put there was the bug.** `image` is optional on `CaseStudyTile` and the next-study band passes none, so `{image && …}` renders nothing. An empty 16:9 `Content/Media` at the measure is 517px of near-invisible plate, which read on canvas as a huge unexplained gap between the "Next" label and the discipline tag. The linter now fails a next-study tile that has one.

**`.tile__cue` is an Icon Button in Figma and deliberately not one in code.** The 48px circled arrow borrows the icon-button classes *precisely so the visual cannot drift from the real component*, while staying a `span` — a real button there would be interactive content nested inside an anchor, invalid, and a second tab stop for something the title link already does. Figma has no semantics to lose, so an `Action/Icon Button` instance at `secondary/lg` is the faithful build and the one that honours the stated intent.

**`IconButton` renders in exactly two places on the whole site:** the Nav's mobile trigger and sheet close, and the Carousel's prev/next arrows at `secondary/md`. Neither appears on a desktop case study except through the carousel, which is why the templates had none until the carousel was built.

**An `INSTANCE_SWAP` property takes the target component's NODE ID, not a variant name** — and this is the trap worth carrying. `setProperties({'icon#9:253': 'chevron-left'})` is silently invalid. Worse, it was written inside a `try/catch`, so the throw was swallowed and the carousel shipped **two identical right-pointing arrows** that looked deliberate. Resolve the id from the `Icon` set first, and **never wrap a `setProperties` call in a bare catch**: the whole value of the call is that it fails loudly when the argument is wrong.

**An empty `Content/Media` in Figma is LESS faithful than a labelled one.** The real component renders a placeholder when it has no `src` — "Image needed", the alt text, and the ratio — precisely so a missing image cannot pass as a finished section. An unlabelled instance is `bg/widget` at 4% black, which on a sunken band is invisible: the interface section read as a caption floating in a void. The templates now carry a `media__placeholder` in the wrapper frame (an instance cannot take new children) with each slot's real alt string, which is both more readable and closer to what ships.

**Mixed fills are legitimate and the linter had to learn it.** The one paragraph carrying a `<strong>` — `process.principle`, three copy keys in a single `<p>` — has two bound ranges, so `node.fills` returns `figma.mixed` rather than an array and a naive array check reports it as unbound. `getStyledTextSegments(['fills'])` is the correct test.

**That paragraph is deliberately not copy-tagged.** It is three JSON keys in one node, split that way because editing is plain text and a `<strong>` inside one string would be stripped the first time anyone touched it. The importer is one-node-one-ref by design, so this one stays read-only in Figma and is edited through the JSON or the markdown round trip — the same rule as the computed values.

### `Content/Media` did not hold its ratio, fixed 2026-08-18

**Its `image` frame was `FILL` horizontally and `FIXED` vertically with no aspect-ratio lock**, so `ratio=4-3` was true only at the authored 400px width. At the real measure of 920 it rendered 920×300 instead of 920×690 — the variant axis the component exists for, wrong everywhere except where it was drawn. Worse, `resize()` on the instance child **failed silently**, returning no error and changing nothing, so a designer correcting it by hand would think they had.

Fixed with `lockAspectRatio()` on the `image` frame of all eight variants, which is what makes an instance-side height override stick. **`targetAspectRatio` is read-only in the plugin API** — the setter is `lockAspectRatio()`, and trying to assign it throws "has only a getter".

**The published contract did not move**, and that was verified rather than assumed: `design/figma-export.snippet.js` was re-run inside Figma and reproduced **`4180069571` across 133 entries**, unchanged at the time. (That value has since moved to `4147464933` — the footer gained a second link on 2026-08-19.) The checksum hashes each *variant's* size, and locking a child's ratio leaves all eight at 400×225/300/400/533.

**The reasoning is on canvas too.** Section `00 · The system` renders the explanation from `docs/banding-system.md` in Figma, so the page is self-explaining without the repo open. Its role-table swatches are live — bound to `band/base` / `band/sunken` under explicit mode overrides — so "four roles, two variables" demonstrates itself instead of being claimed.

## Skills

Two project skills in `.claude/skills/`, deliberately non-overlapping:

- **`emil-design-eng`** — motion and interaction craft (Emil Kowalski's design engineering philosophy). Easing, durations, press feedback, transform-origin, interruptibility, reduced motion. Carries a "Project overrides" section: no shadows in site chrome, motion values bind to tokens, everything resolves inside an `inverse` band.
- **`anti-slop`** — layout, content, and copy discipline. The tells that make a page read as AI-generated: eyebrows on every section, fake div screenshots, scroll cues, decorative dots, section-number labels, hairline spec tables, filler copy. Ends in a pre-ship checklist.

`anti-slop` is trimmed from a general `design-taste-frontend` skill. Three of its rules were **removed, not softened**, because they contradicted settled decisions: the one-theme-per-page lock (kills the banding system), the ban on Inter (Inter is settled, and matches Revolut), and the anti-derivative aesthetic test (the Revolut match is deliberate). Its opening section lists what it may not re-open.

A third skill, `impeccable`, was evaluated and rejected: it's the frontmatter of an npm-packaged skill, with unresolved `{{scripts_path}}` placeholders and ~10 missing `reference/*.md` and `scripts/*.mjs` files it calls mandatory. It would fail on first invocation.

## Next up

**Wise and Healf became real brands on 2026-08-19 rather than lockup swaps — see § Brand packs. Content is still what moves the needle.** 9 pages, 21 components, every check green, no gaps rendering on any live page, three brands live.

**Six claims in this section were stale and were corrected on 2026-08-19: the brand count, the copy item, the host redirect, the README, the Storybook brand toolbar and the number of hostnames the `×` lockup is asked about.** In every one of them the body of this file was already right and only this list was wrong, so the file disagreed with itself rather than with the repo. That is the same failure as the README saying "Eight checks" while nine ran, and as a Figma set's `description` going stale: **prose, in the one place nobody re-reads, describing work that shipped days earlier.** `verify-readme.mjs` and `verify-gates.mjs` exist because a number in markdown cannot compute itself, and **nothing plays that role for this section** — which matters more here than anywhere else in the file, because an open-items list is the first thing the next session reads and the only part of it written to be acted on.

1. **Copy across all three brands.** The last content job, and the only one that changes what a reader thinks. The per-brand override mechanism exists for anything naming a company — write it through the markdown round trip, not a field at a time.
2. ~~Decide whether unmatched hosts should redirect to the apex.~~ **Decided and shipped 2026-08-14**, and the account of it, including the `source: "/(.*)"` trap that cost two deploys and the reason `missing` is the only way to express "any host except these", is in § Brands. **What is still outstanding is the second step it names:** the rule is deliberately `permanent: false`, because a 308 is cached by the browser and is very hard to take back, and promoting it is a decision to be taken once it has been checked against every real host in production.
3. **`og.png` unfurls as the Revolut card on every host. STILL OPEN, and it has now been recorded as closed twice on the same day.** The 2026-08-18 rewrite never ran because a real `dist/og.png` shadowed it; the 2026-08-19 rewrite runs and is never reached, because `og:image` is absolute and names www in every host's HTML. **Both closures verified the layer below the one that matters.** Contained by `robots.txt` and `X-Robots-Tag`, printed on every run by `verify-vercel-config.mjs`. **The brand-pack split landed on 2026-08-19 and did NOT fix it**, which is worth stating because this line predicted it would: a pack repaints a brand, it does not give a brand its own build, and only a per-brand build sets its own `site`. Twice now the open-items list has been right while the prose above it claimed otherwise.
4. ~~Two provenance questions on the exploration imagery.~~ **Both closed 2026-08-17, by reading the files rather than by reasoning about them.**

   - **The Hotels.com half was a false alarm.** Eight of the eleven `hcom-*` compositions were opened. They are genuine captures of the shipped app, and every number on them is ordinary in-product content — prices, review scores, photo counts, and the app's own marketing copy ("81% booked for your travel dates", "Save 50%"). There are no per-variant test percentages overlaid on any of them. The note claiming otherwise was written from memory and was wrong.
   - **The four EGDS `nca-*` panels are reconstructions, and stay as they are — settled, do not re-open.** The decision record they depict was a real artefact, kept outside Figma; the panel is an illustration of it. The images rebuild Figma's chrome closely enough to read as captures, and the "Decisions" tab in them is not a Figma feature, so the cost was raised and accepted: the underlying decisions are real work, and the artwork carries them better than a redrawn block would.

   **What that leaves as a standing hazard, and it is the transferable part:** `design/usage-rules.json` says "Never fake a product UI out of rectangles. Use a real screenshot or nothing", and `anti-slop` repeats it. These are PNGs rather than divs, so the rule's mechanism does not catch them — and **nothing in `verify` can**, because every check here reads text or tokens and this is a claim baked into a picture. Artwork provenance is checked by a person opening the file, or it is not checked.

   **`design/asset-provenance.json` is what that hazard finally got, 2026-08-18**, enforced by `design/verify-provenance.mjs` in the gate. Every image in `src/assets/` declares a `kind` — `capture`, `reconstruction`, `diagram` or `illustration` — and a note saying what someone saw when they opened it. Currently 25 images: 14 captures, 6 illustrations, 4 reconstructions, 1 diagram.

   **It cannot verify a claim and does not pretend to.** A person still has to open the file and be honest. What it removes is the option of never being asked: an undeclared image fails the build, so the claim gets made once, in writing, when the file lands rather than months later from memory. Exactly the trade `Metrics` makes by requiring `source` and `Explorations` by requiring `why` — nothing checks that a number is true, something checks that you said where it came from.

   **It refuses orphans too**, an entry naming a file that no longer exists, because a manifest that keeps describing deleted artwork rots into fiction and the next reader takes it as a record of what is there.

   **The four reconstructions print on every run rather than being silenced.** They are accepted, not hidden. The failure mode of an accepted risk is that it stops being visible and quietly becomes an assumption, which is how this one survived in the first place — and it is the same reason `verify.mjs` prints deprecated components instead of dropping them.
5. ~~No README, so GitHub opens on a bare file tree.~~ **Added 2026-08-19 at `545fd21`**, and it is what controls the first impression now, so a 70KB `CLAUDE.md` naming Revolut throughout is no longer the first thing a visitor meets. `design/verify-readme.mjs` checks the numbers it states, because it is markdown read on GitHub with no build step to substitute into. **Do not sanitise `CLAUDE.md`** — it is the technical record and most of the reason the repo is worth linking.

**Smaller, none blocking:** `/cv` copy is not wired into the browser editor (it still reads `src/data/cv.ts`); the hero and both index covers are still stand-in imagery. `/about` stays unlinked deliberately — the reasoning is at the top of `src/data/nav.ts`, and one entry brings it back.

**Settle the `×` lockup.** An `×` lockup conventionally reads as a partnership, which would imply an engagement that does not exist. Shared directly with a person it is fine; on an open URL it is not. The same question governs making the Storybook public, and it is now asked three times — Ro × Revolut, Ro × Wise and Ro × Healf, on three hostnames.
