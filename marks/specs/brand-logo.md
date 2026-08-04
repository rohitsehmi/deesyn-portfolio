# Brand/Logo

wordmark: the Ro x Revolut lockup, 233x48. It says work made for Revolut rather than work by Revolut, which is the one thing Revolut's wordmark on its own could not say.

mark: Rohit's own disc, 48x48. The RS text stand-in is retired.

The disc is a single evenodd path with the script cut out of it rather than drawn on top. That is what lets the artwork carry one bound fill and still read on a dark band: the disc goes light and the script becomes the band showing through, instead of staying dark.

Fill binds to fg/primary, mirroring var(--rui-color-foreground), so it flips inside an inverse band with no override.

Before anything is published openly: an x lockup conventionally reads as a partnership. Sent to Revolut as an application it says the right thing; on an open URL it claims an engagement that does not exist.

Figma: page **Marks**, set `Brand/Logo` — 2 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `wordmark` · `mark` |

## Don't

- Do not recolour it. The fill binds to fg/primary, mirroring var(--rui-color-foreground), so it flips on its own. The disc is one evenodd path with the script cut out of it, which is what makes the script read as the band showing through rather than staying dark on an inverse band.
- Do not rescale the lockup off its aspect. 233x48 is the artwork natural size, and the mark is 48x48 square.
- Do not use the lockup anywhere it could imply a commercial relationship. An x lockup reads as a partnership. Sent to Revolut as an application it says the right thing; on an open URL it claims something that is not true yet.
- Do not separate the parts and use Revolut wordmark on its own. The whole point of the lockup is that it says work made for Revolut rather than work by Revolut.

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### variant=wordmark · variant=mark

| Node | Property | Token |
|---|---|---|
| `Vector` | fg | `fg/primary` |
