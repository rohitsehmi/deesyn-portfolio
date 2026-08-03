/**
 * Expands design/figma-export.json into one spec file per component,
 * written into the folder that mirrors its Figma page.
 *
 *   node design/build.mjs
 *
 *   Figma page "Icons"      -> icons/specs/
 *   Figma page "Marks"      -> marks/specs/
 *   Figma page "Components" -> components/specs/
 *
 * Each component gets:
 *   <domain>/specs/<slug>.json  — machine-readable contract, tokens resolved
 *   <domain>/specs/<slug>.md    — the same thing, readable
 * plus <domain>/index.json per domain.
 *
 * The export stores TOKEN NAMES, not literals. This resolves each against
 * tokens/tokens.json so a spec carries both the token to reference and the
 * value it currently resolves to per mode. Code consumes the token; the value
 * is there so a spec can be reviewed without opening Figma.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const src = JSON.parse(readFileSync(join(here, 'figma-export.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(join(root, 'tokens', 'tokens.json'), 'utf8'));
// authored guidance, kept separate from what was measured off the nodes
const usage = JSON.parse(readFileSync(join(here, 'usage-rules.json'), 'utf8'));

/** "Size/Button lg" -> "size.button-lg" (same rule the token export uses). */
export const tokenKey = (name) => name.toLowerCase().replace(/\//g, '.').replace(/\s+/g, '-');

const PRIMITIVE_GROUPS = new Set([
  'brand', 'neutral', 'accent', 'status', 'premium', 'metal', 'alpha',
  'space', 'layout', 'radius', 'size', 'breakpoint', 'duration', 'easing'
]);

const dig = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export function resolveToken(name) {
  const key = tokenKey(name);
  if (PRIMITIVE_GROUPS.has(key.split('.')[0])) {
    const node = dig(tokens.primitive, key);
    return node ? { ref: `primitive.${key}`, type: node.$type, value: node.$value } : null;
  }
  const light = dig(tokens.semantic.light, key);
  const dark = dig(tokens.semantic.dark, key);
  if (!light || !dark) return null;
  const deref = (n) => {
    const m = /^\{(.+)\}$/.exec(n.$value);
    if (!m) return n.$value;
    const t = dig(tokens, m[1]);
    return t ? t.$value : n.$value;
  };
  return { ref: `semantic.*.${key}`, type: light.$type, light: deref(light), dark: deref(dark) };
}

export function resolveTextStyle(name) {
  const node = dig(tokens.typography, tokenKey(name));
  return node ? { ref: `typography.${tokenKey(name)}`, ...node.$value } : null;
}

export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function expand(entry) {
  const set = src.tokenSets[entry.t];
  const out = {};
  for (const [node, binds] of Object.entries(set)) {
    const r = {};
    for (const [prop, tokenName] of Object.entries(binds)) {
      if (prop === 'textStyle') r.textStyle = { token: tokenName, ...(resolveTextStyle(tokenName) || {}) };
      else if (prop === 'textDecoration') r.textDecoration = tokenName;
      else {
        const t = resolveToken(tokenName);
        r[prop] = t ? { token: tokenName, ...t } : { token: tokenName, UNRESOLVED: true };
      }
    }
    out[node] = r;
  }
  return out;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) build();

function build() {
  const summary = [];

  for (const [domain, d] of Object.entries(src.domains)) {
    const dir = join(root, domain);
    const specsDir = join(dir, 'specs');
    rmSync(specsDir, { recursive: true, force: true });
    mkdirSync(specsDir, { recursive: true });

    const index = {
      $description: `Contracts for Figma page "${d.page}". Generated — do not edit by hand. Run node design/build.mjs.`,
      figmaPage: d.page,
      generated: src._exported,
      components: []
    };

    for (const [name, c] of Object.entries(d.components)) {
      const s = slug(name);
      const variantAxes = Object.fromEntries(
        Object.entries(c.props).filter(([, x]) => x.type === 'VARIANT').map(([k, x]) => [k, x.values]));
      const otherProps = Object.fromEntries(
        Object.entries(c.props).filter(([, x]) => x.type !== 'VARIANT'));
      const slots = Object.entries(c.props).filter(([, x]) => x.type === 'SLOT').map(([k]) => k);

      const spec = {
        name, slug: s, domain,
        figma: { file: 'UnybX8G5sQIEhLLZN2YFl6', page: d.page, set: name,
                 contract: 'set.getSharedPluginData("spec", "contract")' },
        description: c.description,
        donts: usage.donts[name] || [],
        variantAxes, props: otherProps, slots,
        variantCount: Object.keys(c.variants).length,
        variants: Object.fromEntries(Object.entries(c.variants).map(([vn, v]) => [
          vn, { size: { width: v.size[0], height: v.size[1] }, tokens: expand(v) }
        ]))
      };
      writeFileSync(join(specsDir, `${s}.json`), JSON.stringify(spec, null, 2) + '\n');

      const md = [`# ${name}`, ''];
      md.push(c.description.split('\n').filter(Boolean).join('\n\n'), '');
      md.push(`Figma: page **${d.page}**, set \`${name}\` — ${spec.variantCount} variants. The same contract is on the set itself: \`getSharedPluginData("spec", "contract")\`.`, '');
      if (Object.keys(variantAxes).length) {
        md.push('## Variant axes', '', '| Axis | Values |', '|---|---|');
        for (const [k, v] of Object.entries(variantAxes)) md.push(`| \`${k}\` | ${v.map(x => `\`${x}\``).join(' · ')} |`);
        md.push('');
      }
      if (Object.keys(otherProps).length) {
        md.push('## Properties', '', '| Property | Type | Default |', '|---|---|---|');
        for (const [k, x] of Object.entries(otherProps))
          md.push(`| \`${k}\` | ${x.type} | ${x.default === undefined ? '—' : `\`${JSON.stringify(x.default)}\``} |`);
        md.push('');
      }
      if (slots.length) md.push('## Slots', '', slots.map(x => `- \`${x}\``).join('\n'), '');
      const donts = usage.donts[name] || [];
      if (donts.length) md.push("## Don't", '', donts.map(x => `- ${x}`).join('\n'), '');
      md.push('## Token contract', '',
        'Every value is a token reference, not a literal. `.` is the component root.', '');
      const seen = new Set();
      for (const [, v] of Object.entries(c.variants)) {
        if (seen.has(v.t)) continue;
        seen.add(v.t);
        const shared = Object.entries(c.variants).filter(([, x]) => x.t === v.t).map(([n]) => n);
        md.push(`### ${shared.join(' · ')}`, '', '| Node | Property | Token |', '|---|---|---|');
        for (const [node, binds] of Object.entries(src.tokenSets[v.t]))
          for (const [prop, tok] of Object.entries(binds))
            md.push(`| \`${node}\` | ${prop} | \`${tok}\` |`);
        md.push('');
      }
      writeFileSync(join(specsDir, `${s}.md`), md.join('\n'));

      index.components.push({ name, slug: s, variants: spec.variantCount,
        axes: Object.keys(variantAxes), slots,
        spec: `${domain}/specs/${s}.json`, doc: `${domain}/specs/${s}.md` });
      summary.push({ domain, component: name, variants: spec.variantCount, slots: slots.length });
    }

    writeFileSync(join(dir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  }

  console.log('specs written, mirroring Figma pages');
  console.table(summary);
}
