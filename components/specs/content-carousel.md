# Content/Carousel

A gallery of real screens, one at a time.

Built on scroll-snap rather than a transform track, which decides most of
what follows. With JavaScript off or still loading, this is a horizontally
scrollable list of images that swipes natively on a phone and scrolls with
the keyboard: the content is all in the HTML and none of it depends on the
script. The script adds the arrows, the dots and the autoplay on top.

That is also why the controls are hidden until the script marks the root as
enhanced. A visible arrow that does nothing is worse than no arrow.

The transition is the platform's own scroll, not a tokenised animation. That
is the one deliberate exception to binding motion to the scale: scroll
physics belong to the device, they are interruptible by definition, and a
hand-timed transform would take that away to gain nothing.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Carousel.tsx` and `src/components/Carousel.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `slides` | `CarouselSlide[]` | **yes** |
| `label` | `string` | **yes** |
| `sizes` | `string` | no |
| `backdrop` | `CarouselBackdrop` | no |
| `autoplayMs` | `number` | no |
| `caption` | `string` | no |
| `captionCopyRef` | `string` | no |

### Property notes

- `label` Names the region. Required: `aria-roledescription="carousel"` replaces the role announcement, so without a label the thing announces its type and nothing about its content.
- `sizes` How wide a slide renders, for picking from `srcSet`.
- `backdrop` The plate the slides sit on. Absent falls back to a token-built gradient, which is what the stories use. It is deliberately NOT part of the slides. Baking the backdrop into each exported image means every advance repaints it, and any difference between exports — a pixel of crop, a re-rendered gradient — reads as the background twitching. One element behind a transparent track cannot twitch, and it holds still across a theme change too, because only the fill swaps while the box, the crop and the position stay where they are.
- `autoplayMs` Milliseconds between automatic advances. 0 disables autoplay. Not a duration token, and deliberately so: the motion scale describes how long a thing takes to move, and this is how long it sits still. Binding a dwell to `duration/*` would put a number on that scale which no transition ever uses.
- `caption` A standing caption for the gallery as a whole, below the per-slide label. The two say different things and both are worth having: the label names what is currently on screen and changes under the arrows, the caption makes the argument the whole set exists to make.
- `captionCopyRef` `<file>:<path>` into src/copy, making the caption editable in the browser.

## Don't

- Never autoplay without a way out. Reduced motion disables it, any deliberate input ends it for good, and hover or focus pauses it. Content that moves while someone reads is the failure WCAG 2.2.2 exists for.
- Do not bake the backdrop into the slides. Each advance would repaint it and any difference between exports reads as the background twitching. One element behind a transparent track cannot.
- Do not use it for one image. A gallery of one is a Media, and the controls would point at nothing.
- Do not crop the slides to fill. These are screens with text in them, and cover removes the edges a reader is trying to read.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.carousel` | gap | `primitive.space.sp400` |
| `.carousel` | --carousel-arrow-inset | `primitive.space.sp600` |
| `.carousel` | --carousel-arrow-size | `primitive.size.button-md` |
| `.carousel` | --carousel-slide-gutter | `--carousel-arrow-inset` (local property, not a token) |
| `.carousel` | --carousel-slide-gutter | `--carousel-arrow-size` (local property, not a token) |
| `.carousel` | --carousel-slide-gutter | `primitive.space.sp400` |
| `.carousel__stage` | border-radius | `primitive.radius.r20` |
| `.carousel__stage` | background | `semantic.*.bg.widget` |
| `.carousel__stage` | background | `semantic.*.bg.subtle` |
| `.carousel__stage` | background | `semantic.*.band.sunken` |
| `.carousel__track:focus-visible` | outline | `semantic.*.border.focus` |
| `.carousel__slide` | padding | `primitive.space.sp600` |
| `.carousel__slide` | padding | `--carousel-slide-gutter` (local property, not a token) |
| `.carousel__placeholder` | gap | `primitive.space.sp200` |
| `.carousel__placeholder` | padding | `primitive.space.sp600` |
| `.carousel__placeholder` | color | `semantic.*.fg.secondary` |
| `.carousel__placeholder-kind` | font | `typography.emphasis.3` |
| `.carousel__placeholder-kind` | letter-spacing | `typography.emphasis.3` |
| `.carousel__placeholder-kind` | color | `semantic.*.fg.accent` |
| `.carousel__placeholder-alt` | font | `typography.body.2` |
| `.carousel__placeholder-alt` | letter-spacing | `typography.body.2` |
| `.carousel__arrows [data-carousel-prev]` | left | `--carousel-arrow-inset` (local property, not a token) |
| `.carousel__arrows [data-carousel-next]` | right | `--carousel-arrow-inset` (local property, not a token) |
| `.carousel__dots` | gap | `primitive.space.sp200` |
| `.carousel__dot` | width | `primitive.size.s24` |
| `.carousel__dot` | height | `primitive.size.s24` |
| `.carousel__dot` | border-radius | `primitive.radius.round` |
| `.carousel__dot-mark` | width | `primitive.space.sp200` |
| `.carousel__dot-mark` | height | `primitive.space.sp200` |
| `.carousel__dot-mark` | border-radius | `primitive.radius.round` |
| `.carousel__dot-mark` | background | `semantic.*.fg.secondary` |
| `.carousel__dot-mark` | transition | `semantic.*.duration.tooltip` |
| `.carousel__dot-mark` | transition | `semantic.*.easing.out` |
| `.carousel__dot[aria-current='true'] .carousel__dot-mark` | background | `semantic.*.fg.accent` |
| `.carousel__dot:focus-visible` | outline | `semantic.*.border.focus` |
| `.carousel__label,
.carousel__caption` | font | `typography.body.3` |
| `.carousel__label,
.carousel__caption` | letter-spacing | `typography.body.3` |
| `.carousel__label` | color | `semantic.*.fg.primary` |
| `.carousel__caption` | color | `semantic.*.fg.secondary` |
| `@media (max-width: 767px) { .carousel }` | --carousel-arrow-inset | `primitive.space.sp300` |
| `@media (max-width: 767px) { .carousel__slide }` | padding-block | `primitive.space.sp400` |
