# Chrome/Nav

Height binds to Size/Nav (56). The inner container caps at Size/Max Width (1000) via maxWidth, so the bar spans full-bleed while its content stays on the measure.

state=top is transparent and sits over whatever band is beneath it, which is how it inherits that band's foreground for free. state=scrolled takes bg/canvas plus a 1px border/subtle hairline — no shadow, per the banding system.

One link is primary and the rest are ghost. Three ghost links gave Contact the same weight as CV, which left the page with no opinion about what it wanted the reader to do. There can only be one: a second would put the hierarchy straight back. Ghost is what the other links are for — a low-emphasis action that is still a real button, with real hit area and real press feedback.

CODE-ONLY, AND DELIBERATE: the primary link carries a rotating conic ring on hover and focus. It cannot be a variant here — it is an animation, and it is bound to a pointer state Figma cannot express. Hover-only is the design, not a limitation: the motion gate rates a fixed nav at 100+/day, which resolves to none, while hovering Contact is rare and rare earns delight. A ring rather than a bloom, because site chrome carries no box-shadow.

Code-only props: href per link, aria-current, cta on the one primary link, skip-to-content target.

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

## Don't

- Do not give state=top a fill. Transparent is the point — it inherits whatever band it sits over.
- Never add a shadow to state=scrolled. The hairline is the seam; revolut.com has zero box-shadow.
- Do not exceed one line at desktop. If the items do not fit, cut them — a two-line nav is broken.

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
| `inner/links/Action/Button` | bg | `action/primary-bg` |
| `inner/links/Action/Button/leading/Vector` | fg | `action/primary-fg` |
| `inner/links/Action/Button/label` | textStyle | `Emphasis/2` |
| `inner/links/Action/Button/label` | fg | `action/primary-fg` |
| `inner/links/Action/Button/trailing/Vector` | fg | `action/primary-fg` |

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
| `inner/links/Action/Button` | bg | `action/primary-bg` |
| `inner/links/Action/Button/leading/Vector` | fg | `action/primary-fg` |
| `inner/links/Action/Button/label` | textStyle | `Emphasis/2` |
| `inner/links/Action/Button/label` | fg | `action/primary-fg` |
| `inner/links/Action/Button/trailing/Vector` | fg | `action/primary-fg` |

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
