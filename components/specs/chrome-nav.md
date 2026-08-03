# Chrome/Nav

Height binds to Size/Nav (56). The inner container caps at Size/Max Width (1000) via maxWidth, so the bar spans full-bleed while its content stays on the measure.

state=top is transparent and sits over whatever band is beneath it, which is how it inherits that band's foreground for free. state=scrolled takes bg/canvas plus a 1px border/subtle hairline — no shadow, per the banding system.

Nav links are ghost buttons. That is what the ghost variant exists for: a low-emphasis action that is still a real button, with real hit area and real press feedback.

Code-only props: href per link, aria-current, skip-to-content target.

The actions slot is 140x56 and fills vertically. A SLOT cannot hug on either axis — it is FIXED or FILL — so it needs an explicit size and its content needs positioning inside it.

Figma: page **Components**, set `Chrome/Nav` — 4 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `layout` | `desktop` · `mobile` |
| `state` | `top` · `scrolled` |

## Properties

| Property | Type | Default |
|---|---|---|
| `actions` | SLOT | — |

## Slots

- `actions`

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### layout=desktop, state=top

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Nav` |
| `.` | paddingX | `Layout/l48` |
| `inner` | gap | `Space/sp600` |
| `inner/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/links` | gap | `Space/sp200` |
| `inner/links/Action/Button` | height | `Size/Button sm` |
| `inner/links/Action/Button` | radius | `Radius/Round` |
| `inner/links/Action/Button` | paddingX | `Space/sp500` |
| `inner/links/Action/Button` | gap | `Space/sp200` |
| `inner/links/Action/Button/leading/Vector` | fg | `action/secondary-fg` |
| `inner/links/Action/Button/label` | textStyle | `Emphasis/2` |
| `inner/links/Action/Button/label` | fg | `action/secondary-fg` |
| `inner/links/Action/Button/trailing/Vector` | fg | `action/secondary-fg` |

### layout=desktop, state=scrolled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Nav` |
| `.` | paddingX | `Layout/l48` |
| `.` | bg | `bg/canvas` |
| `.` | border | `border/subtle` |
| `inner` | gap | `Space/sp600` |
| `inner/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/links` | gap | `Space/sp200` |
| `inner/links/Action/Button` | height | `Size/Button sm` |
| `inner/links/Action/Button` | radius | `Radius/Round` |
| `inner/links/Action/Button` | paddingX | `Space/sp500` |
| `inner/links/Action/Button` | gap | `Space/sp200` |
| `inner/links/Action/Button/leading/Vector` | fg | `action/secondary-fg` |
| `inner/links/Action/Button/label` | textStyle | `Emphasis/2` |
| `inner/links/Action/Button/label` | fg | `action/secondary-fg` |
| `inner/links/Action/Button/trailing/Vector` | fg | `action/secondary-fg` |

### layout=mobile, state=top

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Nav` |
| `.` | paddingX | `Space/sp600` |
| `inner` | gap | `Space/sp600` |
| `inner/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/menu/Vector` | fg | `fg/primary` |

### layout=mobile, state=scrolled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Nav` |
| `.` | paddingX | `Space/sp600` |
| `.` | bg | `bg/canvas` |
| `.` | border | `border/subtle` |
| `inner` | gap | `Space/sp600` |
| `inner/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/menu/Vector` | fg | `fg/primary` |
