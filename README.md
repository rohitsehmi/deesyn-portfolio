# deesyn-portfolio

A design portfolio built as a working system, containing case studies written up properly rather than a gallery of screenshots.

## What this is

The site presents a small number of recent, complex screen flows and answers the same questions about each of them in the same order, because that is the order someone reads them in: the problem, the process including the alternatives that were rejected and why, the interface, the measured impact, and finally hindsight. The last of those is the section most portfolios leave out, and it is the cheapest one to be honest in.

Underneath the case studies there is a design system, comprising 249 tokens exported from Figma, 22 components, and a published contract for every one of them. It answers none of the questions above directly, and no reader asks about tokens or visual regression, so it is deliberately kept out of the way. It exists because it buys consistent, polished visuals cheaply, and because a system that verifies itself is a reasonable thing for a design engineer to be able to show.

**On the branding.** The design foundations here reconstruct a public brand's values from its live CSS, as a study in how a system of that kind is put together. This is independent work, and it was not commissioned by, affiliated with, or endorsed by any company whose name or marks appear in it. Sibling hostnames present the same case studies under different lockups, which demonstrates the multi-brand pipeline described below rather than claiming any engagement.

## Running it

```bash
npm install
npm run dev          # Astro dev server
npm run storybook    # component workshop
npm run verify:all   # the gate: exactly what CI runs, so green here is green there
npm run verify       # its source-only subset; no build, so no bands or gaps
npm run build        # production build
```

The full script list, including the token pipeline and the Figma export snippets, is documented in `CLAUDE.md`.

## How it is built

**Astro for the site, plain React for the components.** Astro so that pages ship no JavaScript unless a component explicitly opts in, and unmodified React so that Storybook and Chromatic work normally. There is no MDX; a case study is an `.astro` arrangement over JSON copy, which keeps the writing and the layout separable.

**Every word the site renders lives in `src/copy/*.json`, in reading order.** A page is the arrangement and the JSON is the writing. The copy can be edited in the browser during development, or exported to one markdown document per page and imported back, which is the right instrument when a whole case study needs rewriting and a field at a time is too bitty to judge a voice by.

**Tokens are exported from Figma and checksum-verified against it**, so the design file and the repository cannot drift apart quietly. Components reference semantic tokens and never primitives, which is what makes re-theming a change to one file.

**Contracts are measured, not written.** Each component publishes a specification generated from its bound Figma variables, or, for the nine components that exist only in code, from its own TypeScript declarations and stylesheet. Prose describing a component would document it less precisely than the thing itself does, and would go stale without anything noticing.

**Layout is a banding system.** A band declares a tonal role rather than a colour, and the theme resolves it, so an inverse band is the same band in the other theme rather than a separate set of fills. A band owns the foreground of everything inside it, which means a component dropped into one inverts at zero overrides. Adjacency rules are linted off the built HTML.

**One build serves three brands, chosen by hostname.** The site is prerendered and a single deployment answers every `*.deesyn.com` host, so the brand is a runtime fact rather than a build-time one. Everything brand-specific ships in every document and a blocking inline script sets the brand on the root element before the first paint. This is isolation by routing rather than by build, which is appropriate while the brands are different framings of the same work, and is documented as such.

## What is checked

Sixteen checks run on every push, and the build fails rather than warns. `npm run verify:all` is the one definition of green and the workflow is a single step calling it, so a clean run locally means the same thing as a green build:

- **Types.** `tsc` over the `.ts` and `.tsx` sources, because nothing else in the repository reads TypeScript.
- **Secrets.** Tracked files only, so that the one file legitimately holding a token is not flagged and taught to be ignored.
- **Tokens.** Checksum and alias integrity against the Figma export.
- **Brand packs.** Each brand pack extends the base collection instead of replacing it, so every semantic value in one has to be an alias rather than a literal, both modes have to cover the same tokens, and no two packs may claim the same brand. It prints a checksum that the brand's own Figma file reproduces, which is the only thing stopping the file and the repository drifting apart.
- **Components.** Token integrity, a checksum, and an assertion that no value is a literal.
- **CSS.** Every custom property reference in `src/` resolves, and every font value binds to the type scale. A mistyped custom property is not a CSS error, it renders as an inherited default and looks deliberate.
- **Contrast.** Every foreground and background pair the pages actually use, measured across every brand and both modes, against WCAG AA. Translucent tokens are composited over the band beneath them, because what a 70% white resolves to depends entirely on what it is painted on. Decorative and exempt pairs are measured and printed rather than gated, since a threshold applied to the wrong thing gets fixed by moving a value that was right.
- **Contracts.** Every component has one, asked per component rather than by comparing two totals, which had previously agreed by arithmetic coincidence.
- **Provenance.** Every image declares what it is: a real screenshot, a diagram, abstract artwork, or a reconstruction that imitates a real interface. Nothing can check that the answer is honest, so what this enforces is narrower and still worth having: an image cannot ship until somebody has opened it and written down what they saw.
- **Gates.** The checks that run on a push and the checks that run locally have to be the same checks. They were two separate lists for a while and had already drifted apart.
- **This file.** The numbers stated above are checked against the repository. They cannot be computed here, because this is markdown read on GitHub with no build step to substitute into, so instead they are typed and a program asks whether they are still true — which they twice were not.
- **Generated files.** Anything derived from source is regenerated and compared, because a stale generated file is invisible in a diff.
- **Bands.** Adjacency rules, read from the Figma specification rather than transcribed.
- **Gaps.** A missing fact renders on the page as a visible marker rather than hiding in a comment, and this reads the built pages and fails if one would ship.
- **Deploy configuration.** `vercel.json` is validated by Vercel before install and before build, so a mistake in it fails the deployment without ever producing a build log, and every check above can stay green while the site quietly serves the previous build. That is not hypothetical: an unrecognised key cost eight deployments and a day of stale production. This reads the file — the top-level keys against the set Vercel accepts, and any rewrite whose source is shadowed by a real file in the build output, because the filesystem is matched before rewrites and a shadowed rule never runs.
- **The working record.** `CLAUDE.md` states figures it cannot compute, among them four export checksums, and three of those have sat in it stale while the build printed something else. Each is now read back from the script that prints it rather than recomputed here, so there is no second implementation to drift, and a figure that has moved fails the build instead of sitting there reading as an ordinary sentence.

Visual regression runs separately on Chromatic, which snapshots all 61 stories in both light and dark.

## Reading further

`CLAUDE.md` is the working technical record, and it is long. It carries the reasoning behind the decisions above, the traps that cost real time, and the bugs that reached production along with how each one was caught. It is deliberately not sanitised, because the account of what broke is most of what makes it worth reading.

Supporting documents live alongside it: `docs/banding-system.md` for the layout system, and `tokens/README.md` and `design/README.md` for the token pipeline and the contract build respectively.
