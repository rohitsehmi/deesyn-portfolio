# Action/Icon Button

Square: one size token drives both axes, so Radius/Round resolves to a true circle at every size. 32 / 44 / 48 from Size/Button *, with 16 / 20 / 24 icons.

Separate from Action/Button on purpose. The shape contract differs — square and fixed, not hug-width — and so does the accessibility contract: with no visible text, aria-label is required, not optional. Folding it into Button would also have doubled that set to 54 variants.

Press is scale(0.97) over duration/press with easing/out — documented, not drawn, as everywhere else.

Code-only props: aria-label (REQUIRED), href, target, analytics-id.

Figma: page **Components**, set `Action/Icon Button` — 27 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `primary` · `secondary` · `ghost` |
| `size` | `sm` · `md` · `lg` |
| `state` | `default` · `hover` · `disabled` |

## Properties

| Property | Type | Default |
|---|---|---|
| `icon` | INSTANCE_SWAP | — |

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### variant=primary, size=sm, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/primary-bg` |
| `icon/Vector` | fg | `action/primary-fg` |

### variant=primary, size=sm, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/primary-bg-hover` |
| `icon/Vector` | fg | `action/primary-fg` |

### variant=primary, size=sm, state=disabled · variant=secondary, size=sm, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/disabled-bg` |
| `icon/Vector` | fg | `action/disabled-fg` |

### variant=primary, size=md, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/primary-bg` |
| `icon/Vector` | fg | `action/primary-fg` |

### variant=primary, size=md, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/primary-bg-hover` |
| `icon/Vector` | fg | `action/primary-fg` |

### variant=primary, size=md, state=disabled · variant=secondary, size=md, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/disabled-bg` |
| `icon/Vector` | fg | `action/disabled-fg` |

### variant=primary, size=lg, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/primary-bg` |
| `icon/Vector` | fg | `action/primary-fg` |

### variant=primary, size=lg, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/primary-bg-hover` |
| `icon/Vector` | fg | `action/primary-fg` |

### variant=primary, size=lg, state=disabled · variant=secondary, size=lg, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/disabled-bg` |
| `icon/Vector` | fg | `action/disabled-fg` |

### variant=secondary, size=sm, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/secondary-bg` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=sm, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/secondary-bg-hover` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=md, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/secondary-bg` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=md, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/secondary-bg-hover` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=lg, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/secondary-bg` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=secondary, size=lg, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/secondary-bg-hover` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=sm, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=sm, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/ghost-bg-hover` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=sm, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button sm` |
| `.` | height | `Size/Button sm` |
| `.` | radius | `Radius/Round` |
| `icon/Vector` | fg | `action/disabled-fg` |

### variant=ghost, size=md, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=md, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/ghost-bg-hover` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=md, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button md` |
| `.` | height | `Size/Button md` |
| `.` | radius | `Radius/Round` |
| `icon/Vector` | fg | `action/disabled-fg` |

### variant=ghost, size=lg, state=default

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=lg, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `.` | bg | `action/ghost-bg-hover` |
| `icon/Vector` | fg | `action/secondary-fg` |

### variant=ghost, size=lg, state=disabled

| Node | Property | Token |
|---|---|---|
| `.` | width | `Size/Button lg` |
| `.` | height | `Size/Button lg` |
| `.` | radius | `Radius/Round` |
| `icon/Vector` | fg | `action/disabled-fg` |
