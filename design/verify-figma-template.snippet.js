/* eslint-disable */
// prettier-ignore
/**
 * Lints a Figma page template against the published layout spec.
 *
 * Run via the Figma Console MCP `figma_execute` with the Desktop Bridge plugin
 * open on file UnybX8G5sQIEhLLZN2YFl6. It audits every document on the
 * `Templates` page against the spec that `06 · Page layout` stores on the
 * Banding page — so the file carries both the rules and the checker, and a
 * template can be verified by anyone who can open it.
 *
 * WHY THIS EXISTS. Three rounds of building a case-study template by hand
 * produced three rounds of the same failure, each invisible in a screenshot:
 *
 *   1. Band padding, the measure and four type steps taken from the 768px tier
 *      instead of the 1024px one. Fixed by publishing design/layout-export.json.
 *   2. Contribution, Hindsight and Metrics built from inference, because
 *      publishing the page chrome had only moved the guessing down one level.
 *      Fixed by extending that export to the components inside a band.
 *   3. Every section one band out of place. The band ROLES ran in the correct
 *      legal sequence the whole way, so verify-bands would have passed it, while
 *      the inverse band showed `interface` instead of `impact`.
 *
 * The third is the one that argues for this file. A sequence is not an
 * assignment, and nothing that checks only the sequence can see the difference.
 *
 * NOT part of `npm run verify`, and it cannot be: it reads a live Figma
 * document over the plugin bridge, and the repo has no REST token. It is the
 * Figma-side counterpart to verify-bands.mjs, which lints the built HTML.
 *
 * Returns { documents, failures, fails } — an empty `fails` is a pass.
 */
export const SNIPPET = String.raw`
await figma.loadAllPagesAsync();

// The spec is READ FROM THE FILE, never embedded here. Embedding it would make
// this a second copy that drifts, which is the failure it exists to catch.
const banding = figma.root.children.find(p => p.name === 'Banding');
const raw = banding && banding.getSharedPluginData('layout', 'spec');
if (!raw) return { fatal: 'no layout spec on the Banding page — build 06 · Page layout first' };
const SPEC = JSON.parse(raw);

const BP = '1024';           // these templates are the desktop build
const fails = [];
const bad = (doc, msg) => fails.push(doc + ': ' + msg);

const tpl = figma.root.children.find(p => p.name === 'Templates');
if (!tpl) return { fatal: 'no Templates page' };
const docs = tpl.children.flatMap(s => s.children ? s.children.filter(c => c.name.startsWith('Case study — desktop')) : []);
if (!docs.length) return { fatal: 'no template documents on Templates' };

for (const doc of docs) {
  const L = doc.parent.name;

  /* 1. THE BAND SEQUENCE AND WHAT EACH BAND HOLDS.
        The assignment, not just the roles — see the header. */
  const want = SPEC.page.caseStudy;
  // THE NAV IS CHROME, NOT A BAND. It sits above the first band and carries no
  // band plugin data, so it has to come out before positions are compared —
  // leave it in and every band reads one place along, which reports eight
  // failures per document and names the wrong role in every one of them. The
  // FOOTER is deliberately not filtered: Chrome/Footer at scale=compact IS the
  // closing base/compact band, and the spec's last entry expects to find it.
  const got = doc.children.filter(c => !c.name.startsWith('Chrome/Nav')).map(c => {
    const b = c.getPluginData('band');
    return b ? JSON.parse(b) : { instance: c.name };
  });
  if (got.length !== want.length) bad(L, got.length + ' bands, spec says ' + want.length);
  want.forEach((w, i) => {
    const g = got[i];
    if (!g) return;
    // A component may stand in for a band: Chrome/Footer at scale=compact IS
    // the closing base/compact band, so it carries no plugin data of its own.
    if (g.instance) {
      if (!w.holds.includes('footer')) bad(L, 'band ' + (i+1) + ' is instance "' + g.instance + '" but spec says ' + w.holds.join(' + '));
      return;
    }
    if (g.role !== w.role || g.scale !== w.scale)
      bad(L, 'band ' + (i+1) + ' is ' + g.role + '/' + g.scale + ', spec says ' + w.role + '/' + w.scale + ' for ' + w.holds.join(' + '));
  });

  /* 2. PADDING AND MEASURE, against the scale each band declares. This catches
        "padding wrong for this scale"; a wrong SCALE is caught by 1. */
  for (const b of doc.children) {
    const pd = b.getPluginData('band');
    if (!pd) continue;
    const scale = JSON.parse(pd).scale;
    const wp = SPEC.band[scale][BP];
    if (Math.round(b.paddingTop) !== wp || Math.round(b.paddingBottom) !== wp)
      bad(L, b.name + ' padding ' + Math.round(b.paddingTop) + ', spec ' + wp);
    const col = b.children[0];
    if (col && Math.round(col.width) !== SPEC.measure.contentWidth[BP])
      bad(L, b.name + ' measure ' + Math.round(col.width) + ', spec ' + SPEC.measure.contentWidth[BP]);
  }

  /* 3. NO LITERALS. Every text styled, every fill bound. A missing text style
        leaves Inter Regular at a default size and looks entirely deliberate —
        one build shipped 0 of 121 styles and read fine in a screenshot. */
  const texts = doc.findAll(n => n.type === 'TEXT');
  const uns = texts.filter(t => !t.textStyleId);
  // A paragraph with an emphasised span has MIXED fills, so node.fills returns
  // figma.mixed rather than an array. Checking every styled segment is the
  // correct test; treating mixed as unbound flags legitimate emphasis — which
  // it did, on the one paragraph in the templates that carries a <strong>.
  const boundFill = (t) => {
    const f = t.fills;
    if (Array.isArray(f)) return !!(f[0] && f[0].boundVariables && f[0].boundVariables.color);
    const segs = t.getStyledTextSegments(['fills']);
    return segs.length > 0 && segs.every(s => s.fills[0] && s.fills[0].boundVariables && s.fills[0].boundVariables.color);
  };
  const unb = texts.filter(t => !boundFill(t));
  if (uns.length) bad(L, uns.length + ' text nodes with no text style (' + uns.slice(0,3).map(n => n.name).join(', ') + ')');
  if (unb.length) bad(L, unb.length + ' text nodes with an unbound fill (' + unb.slice(0,3).map(n => n.name).join(', ') + ')');
  const hard = doc.findAll(n => n.type === 'FRAME' && Array.isArray(n.fills) && n.fills.length > 0
    && !(n.fills[0].boundVariables && n.fills[0].boundVariables.color));
  if (hard.length) bad(L, hard.length + ' frames with a literal fill (' + hard.slice(0,3).map(n => n.name).join(', ') + ')');

  /* 4. THE THREE RHYTHM STEPS. */
  for (const p of doc.findAll(n => n.name === 'Prose'))
    if (p.itemSpacing !== SPEC.rhythm.paragraphToParagraph)
      bad(L, 'Prose gap ' + p.itemSpacing + ', spec ' + SPEC.rhythm.paragraphToParagraph);
  for (const s of doc.findAll(n => n.name === 'Section'))
    if (s.itemSpacing !== SPEC.rhythm.headingToContent)
      bad(L, 'Section gap ' + s.itemSpacing + ', spec ' + SPEC.rhythm.headingToContent);

  /* 5. THE BLOCKS INSIDE A BAND, which is where round two went wrong. */
  const c = SPEC.components;
  const con = doc.findOne(n => n.name === 'Contribution');
  if (con && con.itemSpacing !== c.contribution.container.gap)
    bad(L, 'Contribution gap ' + con.itemSpacing + ', spec ' + c.contribution.container.gap);

  const hind = doc.findOne(n => n.name === 'Hindsight');
  if (hind) {
    if (hind.itemSpacing !== c.hindsight.container.gap)
      bad(L, 'Hindsight gap ' + hind.itemSpacing + ', spec ' + c.hindsight.container.gap);
    if (Math.round(hind.paddingLeft) !== c.hindsight.container.padding)
      bad(L, 'Hindsight padding ' + Math.round(hind.paddingLeft) + ', spec ' + c.hindsight.container.padding);
    // It carries its own heading; pairing one prints the same word twice.
    if (hind.parent.findOne(n => n.name === 'Content/Section Heading'))
      bad(L, 'Hindsight is paired with a SectionHeading; it carries its own heading');
  }

  const met = doc.findOne(n => n.name === 'Metrics');
  if (met) {
    if (met.itemSpacing !== c.metrics.container.gap)
      bad(L, 'Metrics gap ' + met.itemSpacing + ', spec ' + c.metrics.container.gap);
    // The source line is a CHILD of .metrics, not a peer block below it.
    if (!met.findOne(n => n.name === 'metrics__source'))
      bad(L, 'Metrics has no source line inside it');
  }
}

return { documents: docs.map(d => d.parent.name), failures: fails.length, fails };
`;