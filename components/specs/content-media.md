# Content/Media

Real screenshots and photography only — never a product UI faked out of rectangles. inset carries r20; bleed is square because it runs to the band edge. Caption is a text property, not a slot: captions are plain text, and decorative photo credits are banned.

Figma: file `UnybX8G5sQIEhLLZN2YFl6`, page **Components**, set `Content/Media`. 8 variants.

## Variant axes

| Axis | Values |
|---|---|
| `ratio` | `16-9` · `4-3` · `1-1` · `3-4` |
| `fit` | `inset` · `bleed` |

## Properties

| Property | Type | Default |
|---|---|---|
| `caption` | TEXT | `"Caption"` |
| `show-caption` | BOOLEAN | `false` |

## Token contract

Every value below is a token reference, not a literal. `.` is the component root.

### ratio=16-9, fit=inset · ratio=4-3, fit=inset · ratio=1-1, fit=inset · ratio=3-4, fit=inset

| Node | Property | Token |
|---|---|---|
| `.` | gap | `Space/sp400` |
| `image` | radius | `Radius/r20` |
| `image` | bg | `bg/subtle` |
| `caption` | textStyle | `Body/3` |
| `caption` | fg | `fg/secondary` |

### ratio=16-9, fit=bleed · ratio=4-3, fit=bleed · ratio=1-1, fit=bleed · ratio=3-4, fit=bleed

| Node | Property | Token |
|---|---|---|
| `.` | gap | `Space/sp400` |
| `image` | bg | `bg/subtle` |
| `caption` | textStyle | `Body/3` |
| `caption` | fg | `fg/secondary` |
