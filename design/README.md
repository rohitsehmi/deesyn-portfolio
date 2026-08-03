# Design system pipeline

Extracts every component contract from Figma file `UnybX8G5sQIEhLLZN2YFl6` and writes it into the repo, split by domain so the folders mirror the Figma pages one-to-one.

| Figma page | Repo folder | Contents |
|---|---|---|
| **Icons** | [`../icons/`](../icons/) | 1 set, 12 icons |
| **Marks** | [`../marks/`](../marks/) | 1 set, 2 marks |
| **Components** | [`../components/`](../components/) | 9 sets, 78 variants |
| Foundations — Revolut | [`../tokens/`](../tokens/) | 246 tokens |
| Banding | [`../docs/banding-system.md`](../docs/banding-system.md) | `Layout/Band`, 12 variants |

```bash
node design/build.mjs    # regenerate every <domain>/specs/ and index.json
node design/verify.mjs   # integrity + no-literals + checksum, exits non-zero on failure
```

## Files

| File | Role |
|---|---|
| `figma-export.json` | Compact export read off the Figma nodes. **Source of truth.** |
| `figma-export.snippet.js` | The snippet that produces it, run inside Figma |
| `build.mjs` | Expands the export into per-domain spec files |
| `verify.mjs` | Integrity, no-literals, checksum |

`<domain>/specs/` and `<domain>/index.json` are generated. Don't hand-edit — change Figma, re-export, rebuild.

## Why icons and marks are not components

An icon is an asset: a flat, growing collection with no configuration axis and a different maintenance cadence. A mark is brand furniture — `variant=wordmark|mark` selects an asset, it does not express state. Neither behaves like `Action/Button`, which has a real variant matrix, and neither should sit in the same drawer. They are consumed *by* components, which is why `Chrome/Nav` nests both.

## Why the spec lives on the component, not the page

Each component set carries its own contract:

```js
set.getSharedPluginData('spec', 'contract')
```

A designer opening `Action/Button` sees Button's contract on that section. There is no page-level blob to scroll past, and no ambiguity about which spec describes what. The snippet writes these back as part of every export, so they cannot go stale independently of the repo.

## What makes it trustworthy

**The export reads bound variables off the nodes.** Not plugin data, not prose. A value hardcoded in Figma would be *absent* from the export — which is why `verify.mjs` also asserts no contract contains a literal. All 43 referenced values are token names.

**`verify.mjs` cross-checks against `tokens/tokens.json`** and exits non-zero if a referenced token is missing. Rename or delete a token and this fails. It is the check that stops design and code drifting apart quietly, and it is CI-gateable as-is.

**A checksum ties repo to file.** The snippet returns the same canonical hash `verify.mjs` computes. Last matched **2026-08-03**: `4183560310`, 127 entries.

## Reading a spec

`.` is the component root; other keys are node paths. Both the token and its current value are present — **consume the token**; the value is there so a spec can be reviewed without opening Figma, and so a diff shows when a value moves.

```json
"variant=primary, size=lg, state=default": {
  "size": { "width": 100, "height": 48 },
  "tokens": {
    ".": {
      "height": { "token": "Size/Button lg",    "ref": "primitive.size.button-lg", "value": "48px" },
      "radius": { "token": "Radius/Round",      "ref": "primitive.radius.round",   "value": "9999px" },
      "bg":     { "token": "action/primary-bg", "ref": "semantic.*.action.primary-bg",
                  "light": "#191c1f", "dark": "#ffffff" }
    }
  }
}
```

## What the contracts do not cover

Three things Figma cannot express, documented per component rather than pretended into a variant:

- **Press feedback** — `scale(0.97)` over `duration/press` with `easing/out`, on every pressable.
- **Hover motion** — the arrow on `Action/Arrow Link` translates 4px right; `Chrome/Nav` transitions background over `duration/dropdown`.
- **Code-only props** — `href`, `target`, `rel`, `aria-label`, `aria-current`, `analytics-id`. **`Action/Icon Button` requires `aria-label`**: no visible text means no accessible name without one.

`Layout/Band` is deliberately outside this pipeline. It lives on the Banding page with its own machine-readable spec (`page.getSharedPluginData('banding', 'spec')`) because it is a page-layout primitive with adjacency rules, not a UI component. See [`../docs/banding-system.md`](../docs/banding-system.md).
