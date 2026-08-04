/**
 * Emits contracts for the components that exist only in code.
 *
 *   node design/build-code-specs.mjs        (or: npm run specs)
 *
 * design/build.mjs reads Figma and emits a spec per component set. The content
 * components in CODE_ONLY below have no Figma set: their contracts are things a
 * variant cannot express. Metrics requires a `source`, Explorations requires a
 * `why` per item, and both are enforced by the type system rather than by
 * convention. Building them in Figma to satisfy the pipeline would freeze their
 * shape before the case studies are written, and would document them less
 * precisely than the code already does.
 *
 * So they are measured from source instead. Props come from the TypeScript
 * declarations, so an optional prop cannot be recorded as required. Tokens come
 * from the component's own stylesheet. The only authored part is `donts`, which
 * lives in design/usage-rules.json with every other component's, keeping
 * measured and authored separable.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { hash } from './hash.mjs';

const OUT = 'components/specs';
const RULES = JSON.parse(readFileSync('design/usage-rules.json', 'utf8'));

/** The registry is explicit. A component silently missing a spec is the bug. */
const CODE_ONLY = [
  { name: 'Content/Section Heading', base: 'SectionHeading' },
  { name: 'Content/Prose', base: 'Prose' },
  { name: 'Content/Metrics', base: 'Metrics' },
  { name: 'Content/Explorations', base: 'Explorations' },
  { name: 'Content/Hindsight', base: 'Hindsight' },
  { name: 'Content/Contribution', base: 'Contribution' },
  { name: 'Content/Case Study Tile', base: 'CaseStudyTile' },
  { name: 'Content/Parallax', base: 'Parallax' },
  { name: 'Chrome/Theme Toggle', base: 'ThemeToggle' }
];

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * --semantic-fg-primary -> semantic.*.fg.primary, matching the Figma specs.
 *
 * Built as a lookup from tokens.json rather than by splitting on hyphens,
 * because the split is ambiguous: --type-ui-heading-1 is typography.ui.heading-1,
 * not typography.ui.heading.1, and nothing in the name says where the boundary
 * falls. A reference that is not in the map is a bug, so it throws.
 */
const TYPE_SUFFIXES = ['-family', '-weight', '-size', '-line', '-tracking'];

function buildTokenMap() {
  const t = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
  const map = new Map();
  const walk = (node, path, ref) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      const next = [...path, k];
      if (v && v.$value !== undefined) map.set(`--${next.join('-')}`, ref(next));
      else if (v && typeof v === 'object') walk(v, next, ref);
    }
  };
  walk(t.primitive, ['primitive'], (p) => p.join('.'));
  walk(t.semantic.light, ['semantic'], (p) => `semantic.*.${p.slice(1).join('.')}`);
  walk(t.shadow, ['shadow'], (p) => p.join('.'));
  walk(t.gradient, ['gradient'], (p) => p.join('.'));
  walk(t.typography, ['type'], (p) => `typography.${p.slice(1).join('.')}`);
  return map;
}
const TOKEN_MAP = buildTokenMap();

/** tokens.json owns these prefixes; anything else is the component's own. */
const TOKEN_NAMESPACES = ['--primitive-', '--semantic-', '--type-', '--shadow-', '--gradient-'];

/**
 * A reference is either a design token or a local property the component
 * declares for itself, such as `--parallax-drift`. Locals are part of the
 * contract, so they are recorded, but they are not tokens and are not claimed
 * to be. Anything inside a token namespace that does not resolve is a bug.
 */
function resolveRef(cssVar) {
  // Longhands of a text style resolve to the style itself; the CSS property
  // already records which part of it is being used.
  const base = TYPE_SUFFIXES.reduce(
    (v, s) => (v.startsWith('--type-') && v.endsWith(s) ? v.slice(0, -s.length) : v), cssVar);
  const ref = TOKEN_MAP.get(base);
  if (ref) return { ref };
  if (TOKEN_NAMESPACES.some((ns) => cssVar.startsWith(ns))) {
    throw new Error(`${cssVar} is in a token namespace but resolves to no token in tokens.json`);
  }
  return { local: cssVar };
}

/**
 * Reads the props interface and the component's doc comment.
 *
 * Hand-written rather than using the TypeScript compiler API, because
 * typescript@7 is the Go port and exposes no JS API at all: `require`ing it
 * yields exactly two keys, `version` and `versionMajorMinor`. Adding a second
 * TypeScript purely to parse six simple interfaces is a worse trade.
 *
 * It is not a general parser and does not pretend to be. It handles the shape
 * these files actually use, and throws rather than returning a partial answer,
 * so a prop can never be silently dropped from a contract.
 */
function readProps(file, base) {
  const src = readFileSync(file, 'utf8');
  const wanted = `${base}Props`;

  const start = src.indexOf(`export interface ${wanted} {`);
  if (start === -1) throw new Error(`${file}: no "export interface ${wanted}"`);

  // Balanced braces, so a nested object type cannot end the block early.
  const open = src.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) { end = i; break; }
  }
  if (end === -1) throw new Error(`${file}: unterminated interface ${wanted}`);
  const body = src.slice(open + 1, end);

  // Split members on semicolons that are not inside a nested type and not
  // inside a comment. Prose in a doc comment contains semicolons, and splitting
  // on one cuts a member in half.
  const members = [];
  let buf = '', d = 0, i = 0;
  while (i < body.length) {
    const two = body.slice(i, i + 2);
    if (two === '/*') {
      const close = body.indexOf('*/', i + 2);
      const stop = close === -1 ? body.length : close + 2;
      buf += body.slice(i, stop);
      i = stop;
      continue;
    }
    if (two === '//') {
      const nl = body.indexOf('\n', i);
      const stop = nl === -1 ? body.length : nl;
      buf += body.slice(i, stop);
      i = stop;
      continue;
    }
    const ch = body[i];
    if ('{<('.includes(ch)) d++;
    else if ('}>)'.includes(ch)) d--;
    if (ch === ';' && d === 0) { members.push(buf); buf = ''; i++; continue; }
    buf += ch;
    i++;
  }
  if (buf.trim()) members.push(buf);

  const props = {};
  for (const raw of members) {
    const note = [...raw.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
      .map((m) => m[1].replace(/^\s*\*/gm, ' ').replace(/\s+/g, ' ').trim())
      .join(' ');
    const decl = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim();
    if (!decl) continue;
    const m = /^([A-Za-z_$][\w$]*)\s*(\?)?\s*:\s*([\s\S]+)$/.exec(decl);
    if (!m) throw new Error(`${file}: could not parse member in ${wanted}: ${JSON.stringify(decl)}`);
    props[m[1]] = {
      type: m[3].replace(/\s+/g, ' ').trim(),
      required: !m[2],
      ...(note ? { note } : {})
    };
  }
  if (Object.keys(props).length === 0) throw new Error(`${file}: ${wanted} parsed to zero props`);

  // The exported function's doc comment is the component's reasoning. Found by
  // walking back from the declaration, not by a lazy regex: `[\s\S]*?` happily
  // spans intervening `*/`, which swallowed every interface comment above it.
  const fnAt = src.indexOf(`export function ${base}`);
  if (fnAt === -1) throw new Error(`${file}: no "export function ${base}"`);
  const before = src.slice(0, fnAt);
  const docEnd = before.lastIndexOf('*/');
  const docStart = docEnd === -1 ? -1 : before.lastIndexOf('/**', docEnd);
  const attached = docEnd !== -1 && /^\s*$/.test(before.slice(docEnd + 2));
  const description = attached && docStart !== -1
    ? before.slice(docStart + 3, docEnd).replace(/^\s*\*/gm, '').split('\n').map((s) => s.trim()).join('\n').trim()
    : '';

  return { props, description };
}

/** Token references per selector, with media-query context preserved. */
function readTokens(file) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const out = {};
  const stack = [];
  let buffer = '';

  for (const ch of css) {
    if (ch === '{') { stack.push(buffer.trim()); buffer = ''; continue; }
    if (ch === '}') {
      const selector = stack.pop();
      if (selector && !selector.startsWith('@')) {
        const media = stack.filter((s) => s.startsWith('@'));
        const key = media.length ? `${media.join(' ')} { ${selector} }` : selector;
        const found = [];
        for (const [, prop, value] of buffer.matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)) {
          for (const [, cssVar] of value.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
            found.push({ property: prop.trim(), var: cssVar, ...resolveRef(cssVar) });
          }
        }
        if (found.length) out[key] = (out[key] ?? []).concat(found);
      }
      buffer = '';
      continue;
    }
    buffer += ch;
  }
  return out;
}

function markdown(spec) {
  const l = [];
  l.push(`# ${spec.name}`, '');
  if (spec.description) l.push(spec.description, '');
  l.push(`**Code only.** ${spec.source.why}`, '');
  l.push(`Implementation: \`${spec.source.component}\` and \`${spec.source.styles}\`.`, '');

  l.push('## Properties', '');
  l.push('| Property | Type | Required |', '|---|---|---|');
  for (const [name, p] of Object.entries(spec.props)) {
    l.push(`| \`${name}\` | \`${p.type}\` | ${p.required ? '**yes**' : 'no'} |`);
  }
  l.push('');

  const notes = Object.entries(spec.props).filter(([, p]) => p.note);
  if (notes.length) {
    l.push('### Property notes', '');
    for (const [name, p] of notes) l.push(`- \`${name}\` ${p.note}`);
    l.push('');
  }

  if (spec.donts.length) {
    l.push("## Don't", '');
    for (const d of spec.donts) l.push(`- ${d}`);
    l.push('');
  }

  l.push('## Token contract', '');
  l.push('Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.', '');
  l.push('| Selector | Property | Token |', '|---|---|---|');
  for (const [selector, entries] of Object.entries(spec.tokens)) {
    for (const e of entries) {
      const value = e.ref ? `\`${e.ref}\`` : `\`${e.local}\` (local property, not a token)`;
      l.push(`| \`${selector}\` | ${e.property} | ${value} |`);
    }
  }
  l.push('');
  return l.join('\n');
}

const specs = [];
for (const { name, base } of CODE_ONLY) {
  const component = `src/components/${base}.tsx`;
  const styles = `src/components/${base}.css`;
  const { props, description } = readProps(component, base);

  const spec = {
    name,
    slug: slug(name),
    domain: 'components',
    source: {
      kind: 'code-only',
      why: 'No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.',
      component,
      styles
    },
    description,
    donts: RULES.donts[name] ?? [],
    props,
    tokens: readTokens(styles)
  };
  specs.push(spec);
  writeFileSync(`${OUT}/${spec.slug}.json`, JSON.stringify(spec, null, 2) + '\n');
  writeFileSync(`${OUT}/${spec.slug}.md`, markdown(spec));
}

/** Canonical form: the contract, not the prose around it. */
const canonical = specs.map((s) =>
  [
    `C|${s.name}`,
    ...Object.entries(s.props).map(([n, p]) => `P|${n}|${p.type}|${p.required ? 'req' : 'opt'}`),
    ...Object.entries(s.tokens).flatMap(([sel, es]) => es.map((e) => `T|${sel}|${e.property}|${e.ref ?? e.local}`))
  ].join('\n')
).join('\n');

console.log(`code-only specs written to ${OUT}/`);
for (const s of specs) {
  const req = Object.values(s.props).filter((p) => p.required).length;
  console.log(`  ${s.slug.padEnd(26)} ${String(Object.keys(s.props).length).padStart(2)} props (${req} required), ${Object.keys(s.tokens).length} selectors`);
}
console.log(`components : ${specs.length}`);
console.log(`entries    : ${canonical.split('\n').length}`);
console.log(`checksum   : ${hash(canonical)}`);
