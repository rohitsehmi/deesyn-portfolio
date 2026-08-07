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

`tone` picks which absolute. It is a property of the image file, not of the
page, and it is the one thing here that cannot be inferred: only a person
looking at the picture knows whether it is dark or pale.

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
| `srcSet` | `string` | no |
| `sizes` | `string` | no |
| `drift` | `string` | no |
| `minHeight` | `string` | no |
| `range` | `'cover' | 'exit'` | no |
| `tone` | `'dark' | 'light'` | no |
| `objectPosition` | `string` | no |
| `scrim` | `boolean` | no |
| `priority` | `boolean` | no |
| `children` | `ReactNode` | no |

### Property notes

- `srcSet` Responsive candidates for `src`, as an `img` srcset string. This component stays a plain React component so Storybook and Chromatic treat it like any other, which means it cannot import Astro's image pipeline. The page does that and passes the result down: `getImage()` in `index.astro` emits the WebP widths, this renders them. Without it the browser gets one file at one size. The source hero is a 3840x2400 PNG, and it is the LCP element on the page it opens.
- `sizes` How wide the image renders. Full-bleed here, so `100vw`.
- `drift` How far the image travels across its whole time on screen. The image layer is exactly this much taller than the section, so the section is covered at every point in the range and can never show a gap. Keep it small. This reads as depth, not as movement.
- `minHeight` Override for the hero height. Left unset by default, deliberately. When this component supplied a default it wrote an inline custom property on every instance, which beats any stylesheet — so the CSS could never make the height responsive, because its fallback was never reached. Passing nothing lets Parallax.css own the defaults per breakpoint, which is where a breakpoint decision belongs. Pass a value only to override both.
- `range` Which stretch of scrolling the drift is spread across. `cover` is the whole time the section overlaps the viewport, which is right for a section in the middle of a page. `exit` runs from the section's top edge leaving the viewport top to its bottom edge doing the same. Use it at the top of a page: there, `cover` begins before the reader can scroll at all, so on a 78vh hero more than half the range is unreachable and the drift looks like a fraction of what was asked for.
- `tone` The tonality of the image, which is a property of the file and not of the theme. `dark` puts the light foreground over it, `light` the dark one. This is the half of "media is absolute" that the first version left implicit. Absolute is not the same as dark: the rule is that the image does not flip with the theme, not that every image is a dark photograph. Get it wrong on a pale image and the only way back to AA is a scrim heavy enough to destroy the thing it is protecting — measured on this project's hero, white text needed the full 70% black, and at 70% the image is gone.
- `objectPosition` `object-position` for the image, as plain CSS. Matters far more than it looks. The section is full-bleed and the image is `object-fit: cover`, so a narrow viewport crops it hard on the horizontal — at 390px this project's hero loses about two thirds of its width. Centred, the part it keeps is the middle, and if the image's quiet area is off to one side the text lands on the busiest region of the picture at exactly the width where there is least room to recover. Measured here: centred, the pale hero failed AA on 33% of glyph pixels at 390px while passing comfortably at 1440px. Anchoring left fixed it and changed nothing on desktop, where the image is not cropped horizontally at all.
- `scrim` Darkens the lower part of the image so content over it clears AA. Defaults to on for a dark image and off for a light one, because a black scrim under a dark foreground actively removes contrast rather than adding it. A pale image earns legibility from composition instead — see the measured quiet-zone widths in `design/measure-media-contrast.mjs`.
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
| `@media (max-width: 767px) { .parallax }` | min-height | `--parallax-min-height` (local property, not a token) |
| `.parallax__image-layer` | height | `--parallax-drift` (local property, not a token) |
| `.parallax__image` | object-position | `--parallax-object-position` (local property, not a token) |
| `.parallax[data-scrim='true'] .parallax__scrim` | background | `semantic.*.bg.scrim` |
| `.parallax[data-scrim='true'] .parallax__scrim` | background | `semantic.*.bg.scrim` |
| `.parallax[data-scrim='true'][data-on-media='light'] .parallax__scrim` | background | `primitive.alpha.white-70` |
| `.parallax[data-scrim='true'][data-on-media='light'] .parallax__scrim` | background | `primitive.alpha.white-70` |
| `.parallax[data-scrim='true'][data-on-media='light'] .parallax__scrim` | background | `primitive.alpha.white-50` |
| `.parallax__content` | padding-block | `primitive.layout.l64` |
| `@media (min-width: 768px) { .parallax__content }` | padding-block | `primitive.layout.l96` |
| `@media (min-width: 1024px) { .parallax__content }` | padding-block | `primitive.layout.l128` |
| `@keyframes parallax-drift { to }` | transform | `--parallax-drift` (local property, not a token) |
