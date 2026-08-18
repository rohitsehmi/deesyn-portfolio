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