/**
 * Which published spec a component file owns, and whether that spec is measured
 * from Figma.
 *
 *   node design/component-specs.mjs src/components/Footer.tsx
 *
 * Why this exists
 * ---------------
 * `.githooks/pre-commit` regenerates specs and stages them, which covers the
 * nine components measured from source. It cannot cover the twelve measured
 * from Figma: changing Footer.tsx regenerates nothing, because
 * components/specs/chrome-footer.json is read off the Figma set rather than off
 * the component. So the hook ran on the commit that added a second footer link,
 * found nothing stale, and said nothing -- on the one commit that had just put
 * code and Figma out of step. See "Changing a component means changing it in
 * BOTH places" in CLAUDE.md.
 *
 * Run as a script it names the Figma sets behind whichever components are being
 * committed. Imported, it is the one matcher verify-contracts.mjs uses, so the
 * hook and the check cannot disagree about which spec a component owns. A
 * second copy of this rule is exactly the failure the `endsWith` bug was, where
 * `Button` matched `action-icon-button` and IconButton silently covered for it.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FIGMA_SPEC_DIRS } from './paths.mjs';

/** The prefixes a spec slug can carry. `Footer.tsx` -> `chrome-footer`. */
export const DOMAINS = ['action', 'content', 'layout', 'chrome', 'brand'];

/** `src/components/IconButton.tsx` -> `icon-button`. Extension and directory
    are stripped so a staged .css resolves the same as its .tsx. */
export const slugFor = (file) =>
  basename(file)
    .replace(/\.(tsx|css)$/, '')
    .replace(/(?<!^)(?=[A-Z])/g, '-')
    .toLowerCase();

/**
 * Every spec file whose slug matches this component.
 *
 * The match is on the WHOLE domain-prefixed name, never a suffix: `Button` is
 * `action-button` and must not also answer to `action-icon-button`.
 */
export function specsFor(file) {
  const slug = slugFor(file);
  const out = [];
  for (const dir of FIGMA_SPEC_DIRS) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.json')) continue;
      const s = name.slice(0, -5);
      if (s === slug || DOMAINS.some((d) => s === `${d}-${slug}`)) out.push({ slug: s, path: `${dir}/${name}` });
    }
  }
  return out;
}

/**
 * The Figma-measured specs among those, one entry per set.
 *
 * A Figma-backed spec carries a `figma` key naming the set it was read from; a
 * code-only one carries `source.kind === 'code-only'` and regenerates from the
 * component itself, so the hook's staleness path already speaks for it.
 */
export function figmaBackedSpecs(files) {
  const seen = new Map();
  for (const file of files) {
    for (const spec of specsFor(file)) {
      if (seen.has(spec.path)) continue;
      const json = JSON.parse(readFileSync(spec.path, 'utf8'));
      if (json.figma?.set) seen.set(spec.path, { ...spec, set: json.figma.set, component: file });
    }
  }
  return [...seen.values()];
}

/*
  Deliberately short, and deliberately not the five-step loop in full. This
  prints on any commit touching a Figma-backed component, most of which change
  behaviour or copy and need nothing done in Figma at all; four steps of
  instructions every time is how a reminder trains people to skip it. It names
  the set, states the condition, and points at the record.
*/
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hits = figmaBackedSpecs(process.argv.slice(2));
  if (hits.length) {
    console.log('pre-commit: these also exist in Figma, and nothing checks that the two agree —');
    for (const h of hits) console.log(`  ${h.component}  ->  ${h.set}`);
    console.log('  If the STRUCTURE changed, so must the set and its description:');
    console.log('  CLAUDE.md § "Changing a component means changing it in BOTH places".');
  }
}
