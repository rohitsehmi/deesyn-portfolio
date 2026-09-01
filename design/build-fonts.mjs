/**
 * Fetches the two typefaces the token scale names and self-hosts them:
 * woff2 files into public/fonts/, @font-face rules into src/styles/fonts.css.
 *
 *   node design/build-fonts.mjs
 *
 * WHY THIS EXISTS. Until 2026-09-01 the site shipped a 23-style type system
 * naming 'Hanken Grotesk' and Inter and LOADED NEITHER, so every visitor read
 * it in system-ui — a different typeface per operating system, on a portfolio
 * whose argument is interface judgement. Zero @font-face rules, zero font
 * files, zero font requests in production. A dead preconnect to
 * fonts.googleapis.com sat in Base.astro pointing at a host nothing asked
 * anything of.
 *
 * IT SURVIVED BECAUSE document.fonts.check() LIES. Chrome returns true for any
 * family it cannot disprove, so the obvious test passes on a font that is not
 * there. The only reliable check is to MEASURE: render a string in the family
 * and in a nonsense family and compare widths. verify-fonts.mjs does the
 * static half of that, and the measurement is written up there.
 *
 * SELF-HOSTED RATHER THAN LINKED FROM GOOGLE, which is a decision and not
 * convenience. A stylesheet link to fonts.googleapis.com sends every visitor's
 * IP and user-agent to Google before the first paint. This site chose cookieless
 * analytics specifically so there would be no consent banner and nothing to
 * disclose; pulling fonts from a third party would put that back and make the
 * claim of no third-party requests false. Self-hosting also removes a render-
 * blocking connection to a host that can be slow or blocked.
 *
 * BOTH FACES ARE OFL. Hanken Grotesk (Hanken Design Co.) and Inter (Rasmus
 * Andersson) are both SIL Open Font License 1.1, which permits redistribution
 * and self-hosting. The OFL text ships beside the files in public/fonts/.
 *
 * VARIABLE FILES, one per family per subset. The scale needs Hanken Grotesk at
 * 400 and 500 and Inter at 400, 500, 600, 700 and 800 — seven static faces, or
 * two variable ones. The wght range is declared on the @font-face so the
 * browser instances what it needs.
 *
 * LATIN AND LATIN-EXT ONLY. Google also serves cyrillic, greek and vietnamese;
 * nothing on this site renders any of them, and each is a file a visitor might
 * otherwise be made to fetch. unicode-range is carried over verbatim from
 * Google's own CSS rather than retyped, so the browser still skips a subset it
 * has no characters for.
 *
 * NOT PART OF `npm run specs`, the same call as build-service-marks.mjs: it
 * needs the network, and these files change roughly never. Run it by hand when
 * a face or a weight changes. What IS in the gate is verify-fonts.mjs, which
 * asserts that every family the token scale names has an @font-face and a file
 * on disk behind it — because the failure this repo actually had was not a
 * wrong font, it was no font at all, silently.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'public/fonts';
const CSS_OUT = 'src/styles/fonts.css';

/* A modern UA is required: Google serves ttf to anything it does not recognise
   as woff2-capable, and the whole point here is the small file. */
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/* Families, their wght range, and the local basename. The ranges are the ones
   tokens.css actually uses — widening them costs bytes for weights nothing
   renders. */
const FAMILIES = [
  { css: 'Hanken Grotesk', query: 'Hanken+Grotesk:wght@400..500', range: '400 500', slug: 'hanken-grotesk' },
  { css: 'Inter', query: 'Inter:wght@400..800', range: '400 800', slug: 'inter' }
];

const KEEP = new Set(['latin', 'latin-ext']);

/* OFL 1.1 requires the licence to travel with the font, so it is fetched
   alongside rather than left as a claim in a comment. Upstream project repos,
   not a paraphrase. */
const LICENCES = [
  { slug: 'hanken-grotesk', path: 'ofl/hankengrotesk/OFL.txt' },
  { slug: 'inter', path: 'ofl/inter/OFL.txt' }
];

const url =
  'https://fonts.googleapis.com/css2?' +
  FAMILIES.map((f) => `family=${f.query}`).join('&') +
  '&display=swap';

const res = await fetch(url, { headers: { 'User-Agent': UA } });
if (!res.ok) throw new Error(`Google Fonts CSS ${res.status}`);
const css = await res.text();

/* Each block is preceded by a /* subset *\/ comment naming the range. */
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)].map((m) => ({
  subset: m[1],
  body: m[2]
}));
if (!blocks.length) throw new Error('no @font-face blocks parsed — Google changed the response shape');

mkdirSync(OUT_DIR, { recursive: true });

const rules = [];
const written = [];
for (const { subset, body } of blocks) {
  if (!KEEP.has(subset)) continue;
  const family = /font-family:\s*'([^']+)'/.exec(body)[1];
  const src = /url\((https[^)]+)\)/.exec(body)[1];
  const uni = /unicode-range:\s*([^;]+);/.exec(body)[1].trim();
  const fam = FAMILIES.find((f) => f.css === family);
  if (!fam) continue;

  const file = `${fam.slug}-${subset}.woff2`;
  const bin = await fetch(src, { headers: { 'User-Agent': UA } });
  if (!bin.ok) throw new Error(`${file}: ${bin.status}`);
  const buf = Buffer.from(await bin.arrayBuffer());
  writeFileSync(join(OUT_DIR, file), buf);
  written.push({ file, kb: Math.round(buf.length / 102.4) / 10 });

  rules.push(
    `@font-face {\n` +
      `  font-family: '${family}';\n` +
      `  font-style: normal;\n` +
      `  font-weight: ${fam.range};\n` +
      /* swap, not block or optional: the type scale is the design, so a
         moment of fallback beats invisible text, and `optional` would let a
         slow connection keep system-ui permanently. */
      `  font-display: swap;\n` +
      `  src: url('/fonts/${file}') format('woff2');\n` +
      `  unicode-range: ${uni};\n` +
      `}`
  );
}

const header = `/* GENERATED by design/build-fonts.mjs — do not edit.
 *
 * Self-hosted so no visitor's IP reaches a third party before the first paint,
 * which is the same decision as cookieless analytics. Both faces are OFL 1.1.
 * Variable files: the weight range is declared here and the browser instances
 * what each token asks for.
 *
 * The families named here must match the ones tokens.css names, and
 * design/verify-fonts.mjs fails the build if they ever stop matching — the bug
 * this replaced was a full type scale naming two faces that never loaded.
 */\n\n`;

writeFileSync(CSS_OUT, header + rules.join('\n\n') + '\n');

for (const l of LICENCES) {
  const r = await fetch(`https://raw.githubusercontent.com/google/fonts/main/${l.path}`);
  if (!r.ok) throw new Error(`${l.slug} OFL: ${r.status}`);
  writeFileSync(join(OUT_DIR, `${l.slug}-OFL.txt`), await r.text());
  written.push({ file: `${l.slug}-OFL.txt`, kb: 0 });
}

console.log(`\n${CSS_OUT}  ${rules.length} @font-face rules`);
for (const w of written) console.log(`  ${OUT_DIR}/${w.file}`.padEnd(46), `${w.kb}kB`);
console.log(`\ntotal ${Math.round(written.reduce((n, w) => n + w.kb, 0) * 10) / 10}kB across ${written.length} files`);
console.log('remember: this is not in `npm run specs` — it needs the network.\n');
