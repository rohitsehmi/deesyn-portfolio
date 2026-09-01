/**
 * How many of each thing there are, counted once.
 *
 * Three places state these numbers: /how-this-was-built renders them, README.md
 * types them, and verify-readme.mjs checks the second against the truth. Two of
 * those used to count independently — which is the failure this repo keeps
 * producing and keeps having to fix.
 *
 * The canonical case: /how-this-was-built said "N in code, M with a published
 * contract" from two counts derived differently, and they agreed at 20 and 20
 * by arithmetic coincidence — Link.tsx publishes two specs, Band.tsx publishes
 * none there, and the two errors cancelled exactly. verify-contracts.mjs exists
 * because of it. The README then drifted twice on the check count for the same
 * reason: a number typed in one place and computed in another.
 *
 * So the counting lives here and everything imports it. A component added or a
 * story written moves every statement about it at once, and nothing has its own
 * opinion about what "a component" means.
 *
 * Paths are CWD-relative, not import.meta.url-relative, because this is
 * imported by an .astro page and Astro bundles it into dist/.prerender/ — where
 * a URL-relative read resolves inside the build output and fails on a file that
 * is plainly there. Same reason, same fix, as design/gate.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { gateChecks } from './gate.mjs';

const COMPONENTS = 'src/components';

/** DTCG leaf tokens: anything carrying a `$value`, `$`-prefixed keys skipped. */
export const leaves = (node) =>
  Object.entries(node).reduce((n, [k, v]) => {
    if (k.startsWith('$')) return n;
    if (v && v.$value !== undefined) return n + 1;
    return v && typeof v === 'object' ? n + leaves(v) : n;
  }, 0);

/** Every leaf token in tokens.json. */
export function tokenCount() {
  return leaves(JSON.parse(readFileSync('tokens/tokens.json', 'utf8')));
}

/**
 * The React components.
 *
 * `.tsx` and not `.stories.tsx`, which is also why analytics.ts, service-marks.ts,
 * number-ticker.ts and carousel-controls.ts are deliberately `.ts`: they are
 * plumbing rather than components and must not move this number.
 */
export function componentFiles() {
  return readdirSync(COMPONENTS).filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'));
}
export const componentCount = () => componentFiles().length;

/** Named exports across the story files — the number Chromatic snapshots. */
export function storyCount() {
  return readdirSync(COMPONENTS)
    .filter((f) => f.endsWith('.stories.tsx'))
    .reduce(
      (n, f) => n + (readFileSync(`${COMPONENTS}/${f}`, 'utf8').match(/export const /g)?.length ?? 0),
      0
    );
}

/** Checks in the gate. Re-exported so callers need one import, not two. */
export const checkCount = () => gateChecks().length;

/**
 * How many brands this build serves.
 *
 * Parsed rather than imported because brands.ts is TypeScript and this module
 * is bundled into the Astro page as well as run under node — the same reason
 * every read here is CWD-relative.
 *
 * It lives here rather than in a check because TWO checks now want it:
 * verify-claude-md.mjs has asked since 2026-08-19, and verify-readme.mjs since
 * 2026-08-26, when README.md started stating the number too. This file exists
 * precisely so the second consumer of a count is not the moment a second
 * implementation of it appears — which is the mistake it was written to undo,
 * and which the endsWith matcher in verify-contracts.mjs had already made once.
 */
export function brandNames() {
  const src = readFileSync('src/data/brands.ts', 'utf8');
  const m = src.match(/export const BRANDS = \[([^\]]*)\]/);
  if (!m) throw new Error('could not find BRANDS in src/data/brands.ts');
  return (m[1].match(/'([^']+)'/g) ?? []).map((q) => q.slice(1, -1));
}

export function brandCount() {
  return brandNames().length;
}

/**
 * The brand each hostname serves, which is the same list seen from the router.
 *
 * The default brand is the apex and carries no subdomain of its own, so the
 * hosts are `deesyn.com` and `www` plus one subdomain per partner. Derived from
 * BRANDS for the reason every count here is derived: the copy of this list in
 * vercel.json is hand-maintained, has no import available to it, and is the
 * only thing standing between a retired hostname and its coming back.
 */
export function brandHosts() {
  const names = brandNames();
  const dflt = readFileSync('src/data/brands.ts', 'utf8').match(
    /export const DEFAULT_BRAND = '([^']+)'/
  );
  if (!dflt) throw new Error('could not find DEFAULT_BRAND in src/data/brands.ts');
  return ['www', ...names.filter((b) => b !== dflt[1])];
}