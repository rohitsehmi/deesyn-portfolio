# Action/Link

Inline prose link. Underlined — an unstyled link inside body copy is an accessibility failure, not a style choice.

Split from Action/Arrow Link deliberately: inside one component set, layers matched by name sync their text style and decoration across variants, so the two could not differ. They are different components anyway — one is prose, one is a call to action.

Code-only props: href, target, rel, aria-label.

Figma: page **Components**, set `Action/Link` — 2 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `state` | `default` · `hover` |

## Properties

| Property | Type | Default |
|---|---|---|
| `label` | TEXT | `"Read the case study"` |

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### state=default

| Node | Property | Token |
|---|---|---|
| `.` | gap | `Space/sp200` |
| `label` | textStyle | `Body/1` |
| `label` | textDecoration | `UNDERLINE` |
| `label` | fg | `fg/link` |

### state=hover

| Node | Property | Token |
|---|---|---|
| `.` | gap | `Space/sp200` |
| `label` | textStyle | `Body/1` |
| `label` | textDecoration | `UNDERLINE` |
| `label` | fg | `fg/link-hover` |
