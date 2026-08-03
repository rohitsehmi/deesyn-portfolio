# Action/Arrow Link

Standalone call-to-action link. Never underlined; the arrow carries the affordance.

Hover translates the arrow 4px right over duration/press with easing/out. Like Button press, that transform is documented rather than drawn.

Code-only props: href, target, rel, aria-label, analytics-id.

Figma: page **Components**, set `Action/Arrow Link` — 2 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `state` | `default` · `hover` |

## Properties

| Property | Type | Default |
|---|---|---|
| `label` | TEXT | `"Read the case study"` |
| `trailing` | INSTANCE_SWAP | — |

## Don't

- Never underline it. The arrow is the affordance; both together is noise.
- Do not use it inside a sentence. It is standalone; inline links are Action/Link.

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### state=default

| Node | Property | Token |
|---|---|---|
| `.` | gap | `Space/sp200` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `fg/link` |
| `trailing/Vector` | fg | `fg/link` |

### state=hover

| Node | Property | Token |
|---|---|---|
| `.` | gap | `Space/sp200` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `fg/link-hover` |
| `trailing/Vector` | fg | `fg/link-hover` |
