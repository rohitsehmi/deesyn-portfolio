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

The section carries `data-on-media`, not a band role. Bands are relative:
`inverse` means this band in the other theme, so it flips with the theme.
A photograph does not. Over media the foreground has to be absolute or it
inverts in one of the two themes, which is white text in light mode and
dark text in dark mode over the same dark image.

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
| `range` | `'cover' | 'exit'` | no |
| `scrim` | `boolean` | no |
| `topOfPage` | `boolean` | no |
| `priority` | `boolean` | no |
| `children` | `ReactNode` | no |

### Property notes

- `drift` How far the image travels across its whole time on screen. The image layer is exactly this much taller than the section, so the section is covered at every point in the range and can never show a gap. Keep it small. This reads as depth, not as movement.
- `minHeight` Content-led height, per the hero note in the banding spec.
- `range` Which stretch of scrolling the drift is spread across. `cover` is the whole time the section overlaps the viewport, which is right for a section in the middle of a page. `exit` runs from the section's top edge leaving the viewport top to its bottom edge doing the same. Use it at the top of a page: there, `cover` begins before the reader can scroll at all, so on a 78vh hero more than half the range is unreachable and the drift looks like a fraction of what was asked for.
- `scrim` Darkens the lower part of the image so content over it clears AA. Measured against this project's hero image: unscrimmed, the brightest 1% of the text area gives white 3.27:1, which fails. At `bg/scrim` under an inverse band, 70% black, it is 7.99:1, and even the single brightest pixel is 4.57:1. That is why the tonal key below is not optional.
- `topOfPage` Set when this is the first thing on the page. A rubber-band scroll past the top opens a gap above the document, and whatever the canvas is painted with shows through it. On a dark hero that is a pale seam appearing above the image. This continues the section's own surface upward instead, so the hero reads as staying put while the page bounces.
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
| `.parallax__overscroll` | height | `--parallax-min-height` (local property, not a token) |
| `.parallax__overscroll` | height | `--parallax-drift` (local property, not a token) |
| `.parallax__image-layer` | height | `--parallax-drift` (local property, not a token) |
| `.parallax[data-scrim='true'] .parallax__scrim` | background | `semantic.*.bg.scrim` |
| `.parallax[data-scrim='true'] .parallax__scrim` | background | `semantic.*.bg.scrim` |
| `.parallax__content` | padding-block | `primitive.layout.l64` |
| `@media (min-width: 768px) { .parallax__content }` | padding-block | `primitive.layout.l96` |
| `@media (min-width: 1024px) { .parallax__content }` | padding-block | `primitive.layout.l128` |
| `@keyframes parallax-drift { to }` | transform | `--parallax-drift` (local property, not a token) |
