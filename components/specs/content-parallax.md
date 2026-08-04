# Content/Parallax

An image that drifts against the scroll, so the band it sits in gains depth
without anything moving on its own.

Driven by a scroll-driven CSS animation rather than a scroll handler. The
effect on revolut.com sets `transform: translateY(50.3333px)` inline from
JavaScript on every scroll event; doing it in CSS runs it off the main
thread, survives a busy page, and keeps this component shipping zero JS.

Where scroll-driven animations are unsupported the image simply sits still,
which is the same place `prefers-reduced-motion` lands. Nothing is lost but
the depth.

The timing function is `linear` and must stay that way. Scroll position is
the timeline, so easing would decouple the image from the reader's finger.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Parallax.tsx` and `src/components/Parallax.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `src` | `string` | **yes** |
| `alt` | `string` | **yes** |
| `ratio` | `MediaRatio` | no |
| `drift` | `string` | no |
| `priority` | `boolean` | no |

### Property notes

- `ratio` The window's shape. The image is covered into it and drifts inside.
- `drift` How far the image travels across its whole time on screen. The inner column is exactly this much taller than the window, so the window is covered at every point in the range and can never show a gap. Keep it small. This reads as depth, not as movement; past about 100px it stops looking like parallax and starts looking like a bug.
- `priority` Full-bleed heroes should not lazy-load: this is usually the LCP element.

## Don't

- Do not ease it. Scroll position is the timeline, so any curve makes the image lead or lag the readers finger, which is the one thing that makes parallax feel broken rather than deep.
- Do not drive it from a scroll handler. A scroll-driven CSS animation runs off the main thread and keeps the page shipping no JavaScript; a listener drops frames on exactly the busy pages where it matters.
- Do not raise the drift past about 100px. It reads as depth at small values and as a bug at large ones.
- Do not use it on a small image inside the measure. The effect only works full bleed, where the window edge is the band edge and there is nothing beside it to reveal the movement as a trick.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.parallax` | border-radius | `primitive.radius.r20` |
| `.parallax` | background | `semantic.*.bg.subtle` |
| `.parallax__inner` | height | `--parallax-drift` (local property, not a token) |
| `@keyframes parallax-drift { to }` | transform | `--parallax-drift` (local property, not a token) |
