# Action/Button

Pill button. Height, padding, gap and radius all bind to primitives; every fill binds to a semantic token, so it flips inside an inverse band with no override.

PRESS IS NOT A VARIANT. Press feedback is transform: scale(0.97) over duration/press with easing/out — a transform Figma cannot express in a variant without breaking the layout grid. It is recorded in each variant's plugin data and is a code responsibility.

Code-only props to add: href, target, aria-label (icon-only), analytics-id.

Figma: page **Components**, set `Action/Button` — 27 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `primary` · `secondary` · `ghost` |
| `size` | `sm` · `md` · `lg` |
| `state` | `default` · `hover` · `disabled` |

## Properties

| Property | Type | Default |
|---|---|---|
| `label` | TEXT | `"Button"` |
| `icon-leading` | BOOLEAN | `false` |
| `icon-trailing` | BOOLEAN | `false` |
| `leading` | INSTANCE_SWAP | — |
| `trailing` | INSTANCE_SWAP | — |

## Don't

- Ghost is not a primary action. It exists for nav links and tertiary actions; if it is the only button in a band, it is the wrong variant.
- Do not animate press with a variant. Press is scale(0.97) over duration/press — a code concern, deliberately absent here.
- Do not override the fill to match a band. The band owns the foreground; the button already flips.

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### variant=primary, size=sm, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `.` | bg | `action/primary-bg` |
| `leading/Vector` | fg | `action/primary-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/primary-fg` |
| `trailing/Vector` | fg | `action/primary-fg` |

### variant=primary, size=sm, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `.` | bg | `action/primary-bg-hover` |
| `leading/Vector` | fg | `action/primary-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/primary-fg` |
| `trailing/Vector` | fg | `action/primary-fg` |

### variant=primary, size=sm, state=disabled · variant=secondary, size=sm, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `.` | bg | `action/disabled-bg` |
| `leading/Vector` | fg | `action/disabled-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/disabled-fg` |
| `trailing/Vector` | fg | `action/disabled-fg` |

### variant=primary, size=md, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/primary-bg` |
| `leading/Vector` | fg | `action/primary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/primary-fg` |
| `trailing/Vector` | fg | `action/primary-fg` |

### variant=primary, size=md, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/primary-bg-hover` |
| `leading/Vector` | fg | `action/primary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/primary-fg` |
| `trailing/Vector` | fg | `action/primary-fg` |

### variant=primary, size=md, state=disabled · variant=secondary, size=md, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/disabled-bg` |
| `leading/Vector` | fg | `action/disabled-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/disabled-fg` |
| `trailing/Vector` | fg | `action/disabled-fg` |

### variant=primary, size=lg, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/primary-bg` |
| `leading/Vector` | fg | `action/primary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/primary-fg` |
| `trailing/Vector` | fg | `action/primary-fg` |

### variant=primary, size=lg, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/primary-bg-hover` |
| `leading/Vector` | fg | `action/primary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/primary-fg` |
| `trailing/Vector` | fg | `action/primary-fg` |

### variant=primary, size=lg, state=disabled · variant=secondary, size=lg, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/disabled-bg` |
| `leading/Vector` | fg | `action/disabled-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/disabled-fg` |
| `trailing/Vector` | fg | `action/disabled-fg` |

### variant=secondary, size=sm, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `.` | bg | `action/secondary-bg` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=sm, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `.` | bg | `action/secondary-bg-hover` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=md, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/secondary-bg` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=md, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/secondary-bg-hover` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=lg, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/secondary-bg` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=lg, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/secondary-bg-hover` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=sm, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=sm, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `.` | bg | `action/ghost-bg-hover` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=sm, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp500` |
| `.` | gap | `Space/sp200` |
| `leading/Vector` | fg | `action/disabled-fg` |
| `label` | textStyle | `Emphasis/2` |
| `label` | fg | `action/disabled-fg` |
| `trailing/Vector` | fg | `action/disabled-fg` |

### variant=ghost, size=md, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=md, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/ghost-bg-hover` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=md, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp600` |
| `.` | gap | `Space/sp300` |
| `leading/Vector` | fg | `action/disabled-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/disabled-fg` |
| `trailing/Vector` | fg | `action/disabled-fg` |

### variant=ghost, size=lg, state=default

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=lg, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `.` | bg | `action/ghost-bg-hover` |
| `leading/Vector` | fg | `action/secondary-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/secondary-fg` |
| `trailing/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=lg, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | paddingX | `Space/sp800` |
| `.` | gap | `Space/sp300` |
| `leading/Vector` | fg | `action/disabled-fg` |
| `label` | textStyle | `Emphasis/1` |
| `label` | fg | `action/disabled-fg` |
| `trailing/Vector` | fg | `action/disabled-fg` |
