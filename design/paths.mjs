/**
 * Where everything lives, in one file.
 *
 * Today every value is the literal the scripts used to hardcode, so this
 * changes no behaviour whatsoever. What it changes is that the boundary
 * between "shared code" and "one brand's identity" is now written down in a
 * place a program reads, instead of being distributed across a dozen string
 * literals that all happen to agree.
 *
 * Why the grouping is the point
 * -----------------------------
 * The site is one brand today. If it ever serves more than one, the split is
 * not "which files mention the brand by name" — stripping comments, only five
 * rendered strings do that. The split is which files carry an *identity*:
 * tokens, marks, icons, and the Figma contracts measured from them. Those are
 * the BRAND PACK below. Everything above it is machinery that renders whatever
 * pack it is handed, which is exactly what the semantic-token rule bought:
 * components reference `semantic.*` and never `primitive.*`, so they have no
 * opinion about what the values are.
 *
 * The three groups are therefore not decoration. Moving a constant between
 * them is a real decision about what a brand owns.
 *
 * One thing this deliberately does NOT do
 * ---------------------------------------
 * There is no brand switch here — no env var, no argument, no second pack. A
 * configuration path that nothing exercises is a path that does not work, and
 * finding that out later is worse than not having written it. This is the seam,
 * not the mechanism. When a second pack exists these become a function of it,
 * and the scripts that import them do not change again.
 */

/* ------------------------------------------------------------------ *
 * FRAMEWORK — shared by every brand. Never varies.
 * ------------------------------------------------------------------ */

/** The React components. One set, rendered by every brand. */
export const COMPONENTS_DIR = 'src/components';

/** All CSS and TSX the token linter reads. */
export const SRC_DIR = 'src';

/**
 * Contracts measured from TypeScript and CSS rather than from Figma.
 *
 * Brand-agnostic, and that is verified rather than assumed: buildTokenMap() in
 * build-code-specs.mjs maps custom properties to token *reference names*
 * (`semantic.*.fg.primary`), never to values. Two brands produce byte-identical
 * code-only specs as long as they keep the same semantic token names — which
 * they must, because the framework's stylesheets reference them.
 *
 * Shares a directory with the Figma-derived specs today. Those separate if a
 * second pack ever lands, since only one of the two kinds is brand-specific.
 */
export const CODE_SPECS_DIR = 'components/specs';

/** Authored failure modes, merged into every spec. Not measured, not branded. */
export const USAGE_RULES = 'design/usage-rules.json';

/**
 * The page layout, parsed out of the stylesheets that render it.
 *
 * Framework rather than brand pack, and the reason is the same one that puts the
 * code-only specs here: these are structural values — band padding, the measure,
 * the vertical rhythm, which text style each element steps to — and they are
 * identical whatever the tokens resolve to. A second brand pack changes what
 * `display/l` looks like, not the fact that a case-study title renders it above
 * 1024px.
 */
export const LAYOUT_EXPORT = 'design/layout-export.json';

/* ------------------------------------------------------------------ *
 * BRAND PACK — one set of these per brand.
 * ------------------------------------------------------------------ */

/** W3C DTCG tokens. The file every other brand value is derived from. */
export const TOKENS = 'tokens/tokens.json';

/** Read off the Figma nodes. Nobody writes it, so it cannot flatter the system. */
export const FIGMA_EXPORT = 'tokens/figma-export.json';

/**
 * Contracts measured from Figma's bound variables.
 *
 * Brand-specific in a way the code-only specs are not: `Action/Button` binds to
 * whichever pack's variables its own Figma file defines, so the same component
 * publishes a different contract per brand.
 */
export const FIGMA_SPEC_DIRS = ['components/specs', 'icons/specs', 'marks/specs'];

/**
 * The brand marks, as path data exported from Figma.
 *
 * Imported statically by build-favicon.mjs and build-og-image.mjs, which is why
 * those two read this constant for their *output* paths but still name the
 * module inline. A static import cannot take a runtime value; converting them
 * is a one-line change to a dynamic import when there is a second pack to point
 * at, and doing it before then would add an untested code path for nothing.
 */
export const LOGO_PATHS = 'src/components/logo-paths.ts';

/** The icon set. Real Revolut assets today, verbatim from assets.revolut.com. */
export const ICON_PATHS = 'src/components/icon-paths.ts';

/** Generated from the mark and the tokens, never drawn. */
export const FAVICON_OUT = 'public';
/**
 * The social cards, one per brand, as `public/og-<brand>.png`.
 *
 * There is deliberately NO bare og.png. vercel.json rewrites /og.png per host,
 * and Vercel matches the filesystem before rewrites, so a file at that path
 * would shadow every rule and serve one brand's card to all of them — which it
 * did, silently, for a day.
 */
export const OG_IMAGE_DIR = 'public';

/** `npm run tokens` writes this from TOKENS. Every var(--*) in src/ resolves here. */
export const TOKENS_CSS = 'src/styles/tokens.css';

/**
 * Everything a generator owns, as git pathspecs.
 *
 * Regenerating must be a no-op; if it is not, someone hand-edited an output
 * instead of changing the source and re-exporting. verify-generated.mjs diffs
 * exactly this list, so a new generated artefact is added here once rather than
 * in both the script and the CI workflow — which is the arrangement that let a
 * checksum in CLAUDE.md go stale three times.
 */
/**
 * The Figma-write snippet is generated because it must carry every value it
 * writes: a plugin sandbox cannot read this repo, so the snippet is a second
 * copy of the pack by necessity. Generating it is what stops that copy being a
 * hand-maintained one, which is the failure every other entry here exists for.
 */
export const BRAND_SNIPPET = 'tokens/brand-apply.snippet.js';

export const GENERATED = [TOKENS_CSS, TOKENS, 'icons/', 'marks/', 'components/', FAVICON_OUT, LAYOUT_EXPORT, BRAND_SNIPPET];

/* ------------------------------------------------------------------ *
 * CONTENT — the case studies. Shared pool, selected per site.
 * ------------------------------------------------------------------ */

/**
 * Every word the site renders.
 *
 * Content, not brand: the Hotels.com and Expedia studies are the same work
 * whoever reads them. Only the framing copy — the home hero, the build page —
 * is site-specific, and that is a much smaller set than it looks.
 */
export const COPY_DIR = 'src/copy';

/** Working surface for the markdown round trip. Gitignored. */
export const COPY_DRAFTS_DIR = 'copy-drafts';

/** Imagery. Goes through Astro's build, never served from public/. */
export const ASSETS_DIR = 'src/assets';

/* ------------------------------------------------------------------ *
 * BUILD OUTPUT
 * ------------------------------------------------------------------ */

export const DIST = 'dist';

/**
 * The deploy contract, and the one file in the deploy path no other check
 * reads.
 *
 * Vercel validates it before install and before build, so a mistake here fails
 * the deployment without producing a build log — which is how an unknown key
 * cost eight deploys and eighteen hours of stale production on 2026-08-19 while
 * CI stayed green. verify-vercel-config.mjs is what now reads it.
 */
export const VERCEL_CONFIG = 'vercel.json';