# Chrome/Nav

Height binds to Size/Nav (64). Raised from 56 on 2026-08-10: the mobile trigger moved to the md button size (44) so the touch target clears Apple's 44pt minimum and WCAG 2.5.5, and 56 left it 6px of air top and bottom. The inner container caps at Size/Max Width (1000) via maxWidth, so the bar spans full-bleed while its content stays on the measure.

state=top is transparent and sits over whatever band is beneath it, which is how it inherits that band's foreground for free. state=scrolled takes bg/canvas plus a 1px border/subtle hairline — no shadow, per the banding system.

The mark is the Ro x Revolut lockup at height 32, which is what the code renders. It says the work was made for Revolut rather than by them; the wordmark alone read as claiming their identity.

One link is primary and the rest are ghost. There can only be one: two ghost links gave Contact the same weight as CV, which left the chrome with no opinion about what it wanted the reader to do, and the whole site exists to start one conversation. Ghost is what the others are for — a low-emphasis action that is still a real button, with real hit area and real press feedback.

Both treatments were briefly removed on 2026-08-10 and restored the same day. What was actually wrong was the mobile sheet, where cta rendered the link in fg/accent — blue display-size text with no pill and no ring, which reads as a mis-styled link rather than as emphasis. The desktop treatment was never the problem, and the sheet no longer restates cta at all.

CODE-ONLY, AND DELIBERATE:

- The conic ring on the primary link, on hover and focus. It cannot be a variant — it is an animation bound to a pointer state. Hover-only is the design: the motion gate rates a fixed nav at 100+/day, which resolves to none, while hovering Contact is rare and rare earns delight. A ring rather than a bloom, because site chrome carries no box-shadow.

- The mobile side sheet. Below 768px the links live in a full-width sheet that enters from the trailing edge over a bg/scrim: transform only, duration/overlay on the easing/drawer curve in, duration/dropdown on easing/out back, because entering is where the user is watching and leaving should get out of the way. Links stagger 40ms from the same edge. Under prefers-reduced-motion the sheet fades in place instead. Figma has no open state and no scroll position, so none of it can be a variant here.

- The sheet carries its own close, at md, positioned to land exactly where the trigger that opened it was. Because it is full width there is no outside to tap: dismissal is that button and Escape.

- While the sheet is open the rest of the page is made inert, so aria-modal="true" is actually true. Without it, tabbing past the last link walked out into the page behind the scrim -- both case-study tiles, the footer link, the skip link, and the theme toggle, which is opacity:0 and pointer-events:none at that moment, so a keyboard user could land on a control they could neither see nor click. Found by a WCAG 2.2 pass on 2026-08-10; axe reports nothing, because no single element is wrong on its own.

- The sheet renders both links at equal weight, deliberately. Two items one tap apart, with the whole list on screen, do not need a hierarchy imposed on them.

- href per link, aria-current, cta on the one primary link, skip-to-content target.

The actions slot is 140x64 and fills vertically, desktop only — .nav__actions is display:none below 768px, so the mobile variants carry no slot. A SLOT cannot hug on either axis, so it needs an explicit size and its content needs positioning inside it.

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
| `inner/menu` | width | `Size/Button md` |
| `inner/menu` | height | `Size/Button md` |
| `inner/menu` | radius | `Radius/Round` |
| `inner/menu/icon/Vector` | fg | `fg/primary` |

### layout=mobile, state=scrolled

| Node | Property | Token |
|---|---|---|
| `.` | height | `Size/Nav` |
| `.` | paddingX | `Space/sp600` |
| `.` | bg | `bg/canvas` |
| `.` | border | `border/subtle` |
| `inner` | gap | `Space/sp600` |
| `inner/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/menu` | width | `Size/Button md` |
| `inner/menu` | height | `Size/Button md` |
| `inner/menu` | radius | `Radius/Round` |
| `inner/menu/icon/Vector` | fg | `fg/primary` |
