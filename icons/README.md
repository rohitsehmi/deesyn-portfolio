# Icons

Contracts for Figma page **Icons** — the icon set — 12 real Revolut assets, used verbatim from `assets.revolut.com`.

An icon is an asset, not a component: a flat, growing collection with no configuration axis. It is consumed by `Action/Button`, `Action/Icon Button`, `Action/Arrow Link` and `Chrome/Nav` via `INSTANCE_SWAP`.

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
