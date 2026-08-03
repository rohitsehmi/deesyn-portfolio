# Components

Machine-readable contracts for every component in the design system, extracted from Figma file `UnybX8G5sQIEhLLZN2YFl6` (page **Components**).

**11 components, 92 variants, 43 distinct tokens, zero literals.**

There is no component *code* here yet — the site hasn't been built. What's here is the contract that code will be generated against, so that Figma and GitHub can't drift apart without something failing loudly.

## Files

| File | Role |
|---|---|
| `figma-export.json` | Compact export read straight off the Figma nodes. **Source of truth.** |
| `figma-export.snippet.js` | The snippet that produces it, run inside Figma |
| `build.mjs` | Expands the export into per-component specs |
| `specs/<name>.json` | **The deliverable** — one machine-readable contract per component |
| `specs/<name>.md` | The same contract, readable |
| `index.json` | Roll-up: every component, its axes, slots, and file paths |
| `verify.mjs` | Integrity, no-literals, and checksum checks |

```bash
node components/build.mjs    # regenerate specs/ and index.json
node components/verify.mjs   # integrity + checksum
```

`specs/` and `index.json` are generated. Don't hand-edit them — change Figma, re-export, rebuild.

## What makes this trustworthy

**The export reads bound variables off the nodes.** It does not read plugin data, and it does not read anything hand-written. If a value were hardcoded in Figma it would simply be absent from the export — which is why `verify.mjs` also asserts that no contract contains a literal. Right now every one of the 43 referenced values is a token name.

**`verify.mjs` cross-checks against `tokens/tokens.json`.** Every token a component references has to resolve. Delete or rename a token and the component build fails — the two systems can't silently disagree. This is the check that matters most, and it exits non-zero so CI can gate on it.

**A checksum ties the repo to the file.** `components/figma-export.snippet.js` returns the same canonical hash that `verify.mjs` computes. Matching checksums mean the repo is a faithful mirror.

Last matched **2026-08-03**: checksum `2019599942`, 127 entries, 11 components / 92 variants / 67 token sets.

## Reading a spec

Each `specs/*.json` carries the variant matrix, the non-variant properties, the slots, and — per variant — the full token contract per node. `.` is the component root; other keys are node paths.

```json
"variant=primary, size=lg, state=default": {
  "size": { "width": 100, "height": 48 },
  "tokens": {
    ".": {
      "height":    { "token": "Size/Button lg",     "ref": "primitive.size.button-lg", "value": "48px" },
      "radius":    { "token": "Radius/Round",       "ref": "primitive.radius.round",   "value": "9999px" },
      "bg":        { "token": "action/primary-bg",  "ref": "semantic.*.action.primary-bg",
                     "light": "#191c1f", "dark": "#ffffff" }
    },
    "label": { "textStyle": { "token": "Emphasis/1", "fontFamily": "Inter", "fontWeight": 600 } }
  }
}
```

Both the token and its current value are present. **Consume the token.** The literal is there so a reviewer can sanity-check a spec without opening Figma, and so a diff shows when a value moved.

## What the contract does not cover

Three things are deliberately absent, because Figma cannot express them and pretending otherwise would be worse than documenting them:

- **Press feedback.** `scale(0.97)` over `duration/press` with `easing/out`, on every pressable. A Figma variant cannot hold a transform without breaking the layout grid, so it is a code responsibility.
- **Hover motion.** The arrow on `Action/Arrow Link` translates 4px right; `Chrome/Nav` transitions its background over `duration/dropdown`.
- **Code-only props.** `href`, `target`, `rel`, `aria-label`, `aria-current`, `analytics-id`. Each component's `description` lists its own. **`Action/Icon Button` requires `aria-label`** — it has no visible text, so without one it has no accessible name.

## Naming

Components group by purpose: `Layout/*`, `Action/*`, `Chrome/*`, `Content/*`, `Brand/*`, plus top-level `Icon`. Variant properties are lowercase (`variant=primary, size=lg`), booleans kebab-case, slot names lowercase nouns.

Token names appear here exactly as Figma spells them (`Size/Button lg`, `action/primary-bg`). `build.mjs` maps them onto `tokens.json` with the same rule the token export uses: lowercase, `/` → `.`, spaces → `-`.

## Related

- [`../tokens/README.md`](../tokens/README.md) — the 246 tokens these resolve against, and why `fg/tertiary` is not a text colour
- [`../docs/banding-system.md`](../docs/banding-system.md) — why components carry no theme of their own: the band owns the foreground, so an instance flips at zero overrides
