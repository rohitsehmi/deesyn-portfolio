# Icon

Every icon is a real Revolut asset from assets.revolut.com, used verbatim — filled paths, matching Revolut's own fill-based mono system. No hand-drawn approximations.

The one exception is arrow-up-right: Revolut ships no diagonal arrow, so it is ArrowThinRight rotated -45°, which keeps the exact weight and geometry of the real asset.

Revolut has no plain ArrowRight either — the thin arrow IS its arrow, which is why arrow-right and arrow-left do not exist here.

chevron-left is chevron-right mirrored about the vertical centre, as real path data rather than a CSS or transform flip. That is not an approximation: Revolut's own set relates chevron-up and chevron-down as exact vertical mirrors of each other, so a mirrored chevron-right is the geometry Revolut would ship. It exists because the carousel's previous control needs it, and faking it with scaleX(-1) at render time mirrors the focus ring and press scale along with the glyph.

Fill binds to fg/primary. Components tint whichever paint a vector uses.

Figma: page **Icons**, set `Icon` — 15 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `name` | `arrow-up-right` · `chevron-down` · `chevron-right` · `menu` · `arrow-thin-right` · `arrow-thin-left` · `arrow-thin-up` · `arrow-thin-down` · `cross` · `envelope` · `chevron-up` · `link` · `moon` · `sun` · `chevron-left` |

## Don't

- Never hand-draw one. Every icon here is a real Revolut asset; an approximation sits next to the real thing and loses.
- Do not restroke them. They are filled paths — Revolut's system is fill-based, not stroke-based.
- Do not use arrow-right or arrow-left. They do not exist: the thin arrow IS Revolut's arrow.

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### name=arrow-thin-right · name=arrow-thin-left · name=arrow-up-right · name=chevron-down · name=chevron-right · name=chevron-left · name=cross · name=menu · name=envelope · name=arrow-thin-up · name=arrow-thin-down · name=chevron-up · name=link · name=moon · name=sun

| Node | Property | Token |
|---|---|---|
| `Vector` | fg | `fg/primary` |
