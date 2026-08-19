#!/usr/bin/env node
/**
 * vercel.json is the one file in the deploy path that nothing else checks.
 *
 * Every other gate in this repo reads source and asks whether it agrees with a
 * token, a contract or a count. None of them open vercel.json, and on
 * 2026-08-19 that turned out to matter: d1cfc70 added a `_comment_rewrites`
 * array to it, in the same prose-beside-data style this repo uses for its own
 * JSON, and Vercel's schema is `additionalProperties: false` over 40 named
 * keys. Every deployment from d1cfc70 to f3ef37f failed — eight of them — and
 * www.deesyn.com served an eighteen-hour-old build the whole time.
 *
 * NOTHING WENT RED, and that is the part worth designing against. Validation
 * happens before install and before build, so there is no build log carrying
 * the error; CI stayed green on all five commits and `verify:all` stayed green
 * locally, because neither reads this file. The symptom was not a failure but
 * silence — the site simply kept serving the previous build, which is
 * indistinguishable from nobody having pushed.
 *
 * `$schema` is on Vercel's allowed list, which is exactly why the file had
 * validated for weeks and why one more key looked equally harmless. The lesson
 * is narrower than "validate your config": vercel.json is SOMEONE ELSE'S
 * SCHEMA, and the habit of explaining a value next to it — which is right in
 * tokens.json, in usage-rules.json and in every export in design/ — does not
 * carry across the boundary.
 *
 *   node design/verify-vercel-config.mjs   (run after `npm run build`)
 *
 * WHY THE ALLOWLIST IS VENDORED RATHER THAN FETCHED. The obvious version of
 * this check downloads https://openapi.vercel.sh/vercel.json and validates
 * against it, which is stricter and wrong: a check that needs the network is a
 * check that goes red on a train, and it would put an outage at Vercel between
 * this repo and a green build. The constraint that actually broke the deploy is
 * the set of legal top-level keys, that set is 40 long and changes rarely, so
 * it is copied in below and dated. Staleness here fails safe in the only
 * direction that matters: a key Vercel adds later is refused loudly with the
 * instruction to refresh, which costs a minute, while an invented key is caught
 * immediately, which is the bug that cost a day.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { DIST, VERCEL_CONFIG } from './paths.mjs';

/*
  Top-level keys Vercel accepts, from `properties` in the published schema.

  Refresh with:
    curl -s https://openapi.vercel.sh/vercel.json |
      node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>
        console.log(Object.keys(JSON.parse(s).properties).sort().join("\n")))'

  Read 2026-08-19, 40 keys. If Vercel adds one and you need it, add it here in
  the same commit that uses it — that keeps this list a record of what was
  checked rather than a wish.
*/
const ALLOWED = new Set([
  '$schema', 'alias', 'build', 'buildCommand', 'builds',
  'bulkRedirectsPath', 'bunVersion', 'cleanUrls', 'crons', 'devCommand',
  'env', 'experimentalBYOC', 'experimentalEnvironmentVariables',
  'experimentalServiceGroups', 'experimentalServices',
  'experimentalServicesV2', 'fluid', 'framework',
  'functionFailoverRegions', 'functions', 'git', 'github', 'headers',
  'ignoreCommand', 'images', 'installCommand', 'name', 'outputDirectory',
  'passiveRegions', 'proxy', 'redirects', 'regions', 'relatedProjects',
  'rewrites', 'routes', 'scope', 'services', 'trailingSlash', 'version',
  'wildcard'
]);

const problems = [];

let config;
try {
  config = JSON.parse(readFileSync(VERCEL_CONFIG, 'utf8'));
} catch (e) {
  console.error(`\n${VERCEL_CONFIG} is not valid JSON, so Vercel will refuse it before building:`);
  console.error(`  ${e.message}\n`);
  process.exit(1);
}

/* ---------------------------------------------------------------- *
 * 1. Unknown top-level keys — the one that broke the deploy.
 * ---------------------------------------------------------------- */

for (const key of Object.keys(config)) {
  if (!ALLOWED.has(key)) {
    problems.push(
      `"${key}" is not a key Vercel accepts, and an unknown key fails the whole ` +
      `deployment at config validation rather than being ignored`
    );
  }
}

/*
  A leading underscore, at ANY depth, named separately.

  The top-level check above already catches `_comment_rewrites` where it
  actually appeared, so this is not redundant: 165 of the 196 object schemas
  inside vercel.json are also closed, so the same instinct one level down —
  a note inside a redirect saying why the host pattern is anchored — breaks the
  deploy just as completely and would otherwise be reported as a generic
  unknown key with no explanation of what to do instead. JSON has no comments.
  The reasoning goes in CLAUDE.md, which is where this file's already did.
*/
const underscored = [];
(function walk(node, path) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`));
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('_')) underscored.push(`${path}${path ? '.' : ''}${k}`);
    walk(v, `${path}${path ? '.' : ''}${k}`);
  }
})(config, '');

for (const path of underscored) {
  problems.push(
    `"${path}" is a comment, and JSON has none — Vercel rejects the file rather ` +
    `than skipping the key. Put the reasoning in CLAUDE.md instead`
  );
}

/* ---------------------------------------------------------------- *
 * 2. Rewrites shadowed by a real file — the silent no-op.
 * ---------------------------------------------------------------- *
 *
 * REDIRECTS ARE EVALUATED BEFORE THE FILESYSTEM AND REWRITES AFTER IT. That
 * ordering is the whole of this check, and it is not visible anywhere in the
 * config: the two blocks sit next to each other in vercel.json and read as
 * symmetrical.
 *
 * It bit on the same day as the key above, in the same commit, and stayed
 * hidden behind it. d1cfc70 added a rewrite from /og.png to /og-wise.png on the
 * Wise host so each brand unfurls its own social card. public/og.png is copied
 * byte-for-byte into dist/, so the static file matches first and the rewrite
 * never runs — every host serves the Revolut card, and the file looks correct
 * while doing nothing at all. Confirmed against production rather than
 * reasoned about: wise.deesyn.com/og.png was sha256-identical to public/og.png.
 *
 * The fix for a shadowed rewrite is to stop shipping a file at the source path,
 * so that every host resolves through a rule — including the default one, which
 * becomes an explicit rewrite with no `has` rather than an implicit file.
 */

if (!existsSync(DIST)) {
  console.error(`\nno ${DIST}/ directory. Run \`npm run build\` first.\n`);
  process.exit(1);
}

/* Only sources that name one literal path can be resolved against the build.
   Anything carrying a pattern — /(.*), /:path* — is left alone rather than
   guessed at, and the redirect that matches every URL is deliberately not in
   scope here because redirects run first and are never shadowed. */
const literal = (source) => /^\/[\w./-]*$/.test(source);

for (const rule of config.rewrites ?? []) {
  if (!literal(rule.source)) continue;
  if (existsSync(`${DIST}${rule.source}`)) {
    problems.push(
      `the rewrite of ${rule.source} -> ${rule.destination} never runs: ` +
      `${DIST}${rule.source} is a real file, and Vercel matches the filesystem ` +
      `before rewrites (redirects are the ones that come first). Stop shipping ` +
      `a file at ${rule.source} and give every host an explicit rule`
    );
  }
}

/* ---------------------------------------------------------------- *
 * 3. Per-host rewrites defeated by an absolute URL in the HTML.
 * ---------------------------------------------------------------- *
 *
 * A rewrite can only run on the host that was asked. Section 2 covers a real
 * file outranking the rule; this covers the other way the request never
 * arrives -- the HTML naming one host outright, so every client asks THAT host
 * whichever one served the page.
 *
 * It is section 2's bug one layer up, found the same day and the same way, by
 * asking production what it served rather than by reading the config. og:image
 * must be ABSOLUTE per the OpenGraph spec, Base.astro builds it from `site` in
 * astro.config.mjs, and one prerendered build has exactly one value for that.
 * So every host's HTML carried https://www.deesyn.com/og.png, an unfurler on
 * wise.deesyn.com fetched www, and www's arm is the default one. Three per-host
 * rules, all correct, all reachable, none ever reached.
 *
 * WHAT WOULD ACTUALLY FIX IT is a build per brand -- the brand-pack split
 * already planned -- or an edge function rewriting the tag. Neither is worth it
 * while robots.txt disallows every agent and the X-Robots-Tag header enforces
 * it, so no compliant unfurler reads the tag at all. The pin is therefore
 * DECLARED below rather than removed, and it prints on every run: an accepted
 * risk that stops being visible has quietly become an assumption, which is why
 * verify-provenance.mjs lists its reconstructions and verify.mjs prints
 * deprecated components instead of dropping them.
 */
const ACCEPTED_PINS = {
  '/og.png': [
    'Accepted 2026-08-19. og:image must be absolute and one prerendered build has',
    'one origin, so every host unfurls the Revolut card. Contained by robots.txt',
    'and X-Robots-Tag, which stop a compliant unfurler reading the tag at all.',
    'The fix is the brand-pack split, not middleware.'
  ]
};

/* Only a source with at least one host condition is making a per-host promise.
   A rewrite with no `has` is the default arm and cannot be defeated this way. */
const perHost = new Set(
  (config.rewrites ?? [])
    .filter((r) => literal(r.source) && (r.has ?? []).some((c) => c.type === 'host'))
    .map((r) => r.source)
);

const pinned = new Map();
if (perHost.size) {
  const pages = readdirSync(DIST, { recursive: true }).filter(
    (f) => typeof f === 'string' && f.endsWith('.html')
  );
  for (const file of pages) {
    for (const m of readFileSync(`${DIST}/${file}`, 'utf8').matchAll(/https?:\/\/[^"'\s<>]+/g)) {
      let path;
      try {
        path = new URL(m[0]).pathname;
      } catch {
        continue;
      }
      if (!perHost.has(path)) continue;
      if (!pinned.has(path)) pinned.set(path, { url: m[0], pages: new Set() });
      pinned.get(path).pages.add(file);
    }
  }
}

for (const [path, hit] of pinned) {
  if (ACCEPTED_PINS[path]) continue;
  problems.push(
    `the per-host rewrites of ${path} never run: ${hit.pages.size} built page(s) ` +
    `name ${hit.url} outright, so every client asks that one host whichever host ` +
    `served the page. Make the reference host-relative, or declare the pin in ` +
    `ACCEPTED_PINS here with what contains it`
  );
}

/* ---------------------------------------------------------------- */

if (problems.length) {
  console.error(`\n${VERCEL_CONFIG} would not deploy — ${problems.length} problem${problems.length > 1 ? 's' : ''}:`);
  problems.forEach((p) => console.error(`  ${p}`));
  console.error('');
  process.exit(1);
}

const rewrites = (config.rewrites ?? []).length;
const checked = Object.keys(config).length;
console.log(`\nvercel.json: ${checked} top-level keys all legal, ${rewrites} rewrite${rewrites === 1 ? '' : 's'} not shadowed by ${DIST}/`);

const carried = [...pinned.keys()].filter((path) => ACCEPTED_PINS[path]);
if (carried.length) {
  console.log(`\nper-host rewrites pinned by an absolute URL — ${carried.length}, accepted`);
  console.log('and live. The rules are correct and nothing ever reaches them:');
  for (const path of carried) {
    const hit = pinned.get(path);
    console.log(`  ${path} — ${hit.pages.size} page(s) name ${hit.url}`);
    ACCEPTED_PINS[path].forEach((line) => console.log(`    ${line}`));
  }
}
console.log('');
