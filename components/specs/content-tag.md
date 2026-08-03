# Content/Tag

Metadata only — role, year, platform. Pill radius to match Button, so the page has one interactive-shape system. Never overlaid on an image.

Figma: file `UnybX8G5sQIEhLLZN2YFl6`, page **Components**, set `Content/Tag`. 2 variants.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `neutral` · `accent` |

## Properties

| Property | Type | Default |
|---|---|---|
| `label` | TEXT | `"designer"` |

## Token contract

Every value below is a token reference, not a literal. `.` is the component root.

### variant=neutral

| Node | Property | Token |
|---|---|---|
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp400` |
| `.` | paddingY | `Space/sp150` |
| `.` | bg | `bg/widget` |
| `label` | textStyle | `Emphasis/3` |
| `label` | fg | `fg/secondary` |

### variant=accent

| Node | Property | Token |
|---|---|---|
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp400` |
| `.` | paddingY | `Space/sp150` |
| `.` | bg | `action/accent-bg` |
| `label` | textStyle | `Emphasis/3` |
| `label` | fg | `action/accent-fg` |
