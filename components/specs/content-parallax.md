# Content/Parallax

A full-bleed image that drifts against the scroll, with content laid over it.

Driven by a scroll-driven CSS animation wherever one is available, which runs
off the main thread and survives a busy page. The equivalent on revolut.com
sets `transform: translateY(-22.8333px)` inline from JavaScript on every
scroll event, which is the path this takes only as a fallback.

The CSS path needs `overflow: clip` rather than `hidden` on the section.
`hidden` creates a scroll container, and `view()` resolves against the
nearest one, so the drift would be measured against a box that never
scrolls and the image would sit perfectly still.

Reduced motion stops it in both paths.

The timing function is `linear` and must stay that way. Scroll position is
the timeline, so easing would decouple the image from the reader's finger.

There is deliberately no entrance fade on the content. Revolut fades theirs
in over 300ms; on a hero that is the LCP element, and delaying the thing the
reader came for costs more than the polish returns.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Parallax.tsx` and `src/components/Parallax.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `src` | `string` | **yes** |
| `alt` | `string` | **yes** |
| `drift` | `string` | no |
| `minHeight` | `string` | no |
| `scrim` | `boolean` | no |
| `band` | `BandRole` | no |
| `underNav` | `boolean` | no |
| `priority` | `boolean` | no |
| `children` | `ReactNode` | no |

### Property notes

- `drift` How far the image travels across its whole time on screen. The image layer is exactly this much taller than the section, so the section is covered at every point in the range and can never show a gap. Keep it small. This reads as depth, not as movement.
- `minHeight` Content-led height, per the hero note in the banding spec.
- `scrim` Darkens the lower part of the image so content over it clears AA. Measured against this project's hero image: unscrimmed, the brightest 1% of the text area gives white 3.27:1, which fails. At `bg/scrim` under an inverse band, 70% black, it is 7.99:1, and even the single brightest pixel is 4.57:1. That is why the tonal key below is not optional.
- `band` The tonal key this section sets. Applied as `data-band` without a scale, because a hero is content-led and does not count toward the band alternation. See the `hero` note in design/banding-export.json.
- `underNav` Pulls the section up under a transparent nav so the image starts at the top of the page and the nav floats over it, which is the whole point of the pattern. Pair with `Nav overBand` so the nav takes this section's foreground while it is still transparent.
- `priority` The LCP element on any page it opens. Should not lazy-load.

## Don't

- Do not ease it. Scroll position is the timeline, so any curve makes the image lead or lag the readers finger, which is the one thing that makes parallax feel broken rather than deep.
- Do not drive it from a scroll handler. A scroll-driven CSS animation runs off the main thread and keeps the page shipping no JavaScript; a listener drops frames on exactly the busy pages where it matters.
- Do not raise the drift past about 100px. It reads as depth at small values and as a bug at large ones.
- Do not use it on a small image inside the measure. The effect only works full bleed, where the window edge is the band edge and there is nothing beside it to reveal the movement as a trick.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.parallax` | min-height | `--parallax-min-height` (local property, not a token) |
| `.parallax__image-layer` | height | `--parallax-drift` (local property, not a token) |
| `.parallax[data-under-nav='true']` | margin-block-start | `primitive.size.nav` |
| `.parallax[data-scrim='true'] .parallax__scrim` | background | `semantic.*.bg.scrim` |
| `.parallax[data-scrim='true'] .parallax__scrim` | background | `semantic.*.bg.scrim` |
| `.parallax__content` | padding-block | `primitive.layout.l64` |
| `@media (min-width: 768px) { .parallax__content }` | padding-block | `primitive.layout.l96` |
| `@media (min-width: 1024px) { .parallax__content }` | padding-block | `primitive.layout.l128` |
| `@keyframes parallax-drift { to }` | transform | `--parallax-drift` (local property, not a token) |
