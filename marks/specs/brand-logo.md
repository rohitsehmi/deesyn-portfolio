# Brand/Logo

wordmark: Revolut's real wordmark, verbatim from the live site, 145x32 natural. Fill binds to fg/primary, mirroring var(--rui-color-foreground).

mark: placeholder. Rohit's own logo goes here — it lives in the CV-Build Figma file, which needs the Desktop Bridge plugin open in it before the asset can be pulled across.

NOTE: Chrome/Nav and Chrome/Footer both instance variant=wordmark, so the site chrome currently shows Revolut's wordmark as its own identity.

Figma: page **Marks**, set `Brand/Logo` — 2 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `wordmark` · `mark` |

## Don't

- Do not recolour it. The fill binds to fg/primary, mirroring var(--rui-color-foreground) — it flips on its own.
- Do not rescale the wordmark off its aspect. 145x32 is the real asset's natural size.
- Decide what the site presents as. Nav and Footer currently instance the Revolut wordmark as the site identity.

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### variant=wordmark

| Node | Property | Token |
|---|---|---|
| `Vector` | fg | `fg/primary` |

### variant=mark

| Node | Property | Token |
|---|---|---|
| `RS` | textStyle | `Heading/S` |
| `RS` | fg | `fg/primary` |
