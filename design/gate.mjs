/**
 * What "green" means, resolved from package.json rather than listed anywhere.
 *
 * `verify:all` is the single definition of the gate — CI runs it, the pre-push
 * hook runs it, and you run it. Several things need to know what is inside it:
 * verify-gates.mjs compares it against the workflow, and /how-this-was-built
 * states the number on the page. Both used to answer that question their own
 * way, and the page's way was counting `- name:` lines in ci.yml, which stopped
 * being true the moment the workflow collapsed to one step.
 *
 * So the expansion lives here once. Anything that wants to know what runs on a
 * push asks this, and a check added to the script is counted everywhere without
 * anyone updating a second list.
 */
import { readFileSync } from 'node:fs';

/*
  Read relative to the working directory, NOT to import.meta.url, and this is
  load-bearing rather than a style choice.

  Unlike everything else in design/, this module is imported by an .astro page,
  so Astro bundles it into dist/.prerender/chunks/ — where `new URL('../',
  import.meta.url)` resolves to a directory inside the build output and the read
  fails with ENOENT on a file that is plainly there. npm scripts and the build
  both run from the repo root, which is why how-this-was-built.astro has always
  read `tokens/tokens.json` this way.
*/
const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;

/** The npm script every other definition of "green" derives from. */
export const GATE = 'verify:all';

/**
 * Every `node <dir>/<name>.mjs` the gate reaches, following `npm run` through.
 *
 * Includes generators as well as checks — `npm run build` pulls in the token
 * builders — because drift detection wants the complete set. Use `gateChecks()`
 * for the narrower question of what is actually being verified.
 */
export function gateScripts(command = `npm run ${GATE}`, seen = new Set()) {
  const found = new Set();
  for (const [, file] of command.matchAll(/node\s+((?:design|tokens)\/[\w.-]+\.mjs)/g)) {
    found.add(file);
  }
  for (const [, name] of command.matchAll(/npm run ([\w:-]+)/g)) {
    if (seen.has(name) || !scripts[name]) continue;
    seen.add(name);
    gateScripts(scripts[name], seen).forEach((f) => found.add(f));
  }
  return found;
}

/**
 * The checks alone, as human-readable names.
 *
 * A check is anything named `verify*`, plus `typecheck` — which is `tsc` rather
 * than a script in design/, and is genuinely a check, so counting only `.mjs`
 * files would undercount by exactly one. Token builders and spec generators are
 * excluded: they produce the things the checks read, and calling them checks
 * would inflate the number the page prints.
 */
export function gateChecks() {
  const names = [...gateScripts()]
    .filter((f) => /\/verify[\w-]*\.mjs$/.test(f))
    .sort();
  return ['typecheck', ...names];
}