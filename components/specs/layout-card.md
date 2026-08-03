# Layout/Card

Three slots: media, content, actions. The card owns shape, surface and rhythm; it does not own what goes inside it.

Padding is on the body frame, not the card, so media bleeds to the edge while content stays inset. clipsContent is on so media respects r20.

A SLOT is not an auto-layout frame — children placed inside one cannot use FILL sizing. Set FILL on the slot itself and size the content explicitly.

Code-only props: href (when the whole card is a link), analytics-id.

SLOT nodes carry their own fill, opaque white by default. Clear it or the slot paints over the band it sits in — invisible on a light band, a white box on an inverse one.

Figma: file `UnybX8G5sQIEhLLZN2YFl6`, page **Components**, set `Layout/Card`. 4 variants.

## Variant axes

| Axis | Values |
|---|---|
| `variant` | `base` · `sunken` |
| `state` | `default` · `hover` |

## Properties

| Property | Type | Default |
|---|---|---|
| `media` | SLOT | — |
| `content` | SLOT | — |
| `actions` | SLOT | — |

## Token contract

Every value below is a token reference, not a literal. `.` is the component root.

### variant=base, state=default · variant=sunken, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | radius | `Radius/r20` |
| `.` | bg | `bg/surface` |
| `.` | border | `border/subtle` |
| `body` | paddingX | `Space/sp1000` |
| `body` | paddingY | `Space/sp1000` |
| `body` | gap | `Space/sp600` |

### variant=base, state=hover

| Node | Property | Token |
|---|---|---|
| `.` | radius | `Radius/r20` |
| `.` | bg | `bg/surface-raised` |
| `.` | border | `border/subtle` |
| `body` | paddingX | `Space/sp1000` |
| `body` | paddingY | `Space/sp1000` |
| `body` | gap | `Space/sp600` |

### variant=sunken, state=default

| Node | Property | Token |
|---|---|---|
| `.` | radius | `Radius/r20` |
| `.` | bg | `bg/subtle` |
| `.` | border | `border/subtle` |
| `body` | paddingX | `Space/sp1000` |
| `body` | paddingY | `Space/sp1000` |
| `body` | gap | `Space/sp600` |
