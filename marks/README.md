# Marks

Contracts for Figma page **Marks** — brand marks — the Revolut wordmark and a mark.

A mark is brand furniture, not a component: `variant=wordmark|mark` selects an asset, it does not express state. It is consumed by `Chrome/Nav` and `Chrome/Footer`.

## Files

- `index.json` — the roll-up for this page
- `specs/<name>.json` — machine-readable contract per component
- `specs/<name>.md` — the same contract, readable

All generated. Don't hand-edit:

```bash
node design/build.mjs
node design/verify.mjs
```

The same contract is on each component set inside Figma: `set.getSharedPluginData("spec", "contract")`.

See [`../design/README.md`](../design/README.md) for how the pipeline works and what the contracts deliberately omit.
