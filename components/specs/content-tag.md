# Content/Tag

Metadata only — role, year, platform. Pill radius to match Button, so the page has one interactive-shape system. Never overlaid on an image.

Figma: page **Components**, set `Content/Tag` — 2 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `neutral` · `accent` |

## Properties

| Property | Type | Default |
|---|---|---|
| `label` | TEXT | `"designer"` |

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

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
