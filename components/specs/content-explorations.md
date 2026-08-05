# Content/Explorations

The paths that were considered and rejected.

This is the section most portfolios skip and the one a case study weights
hardest, so `why` is required on every item. An exploration without a stated
reason for its rejection is a picture, and pictures score nothing here.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Explorations.tsx` and `src/components/Explorations.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `items` | `Exploration[]` | **yes** |
| `copyBase` | `string` | no |

### Property notes

- `copyBase` `<file>:<path>` into src/copy for this list. The index and field are appended, so a base of `study:items` yields `study:items.0.title`. Dev tooling only; inert in a build.

## Don't

- Never show an exploration without saying why it was rejected. The why is the scored content; without it the item is a picture.
- Do not rebuild the artefact out of rectangles. A real wireframe photograph beats a tidy fake, and a fake is the single clearest portfolio tell.
- Do not show only the direction that shipped. The rejected ones are the reason this section exists.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.explorations` | gap | `primitive.layout.l48` |
| `@media (min-width: 768px) { .explorations }` | gap | `primitive.layout.l64` |
| `.explorations__item` | gap | `primitive.space.sp600` |
| `.explorations__media` | border-radius | `primitive.radius.r20` |
| `.explorations__text` | gap | `primitive.space.sp300` |
| `.explorations__title` | font | `typography.heading.s` |
| `.explorations__title` | letter-spacing | `typography.heading.s` |
| `.explorations__title` | color | `semantic.*.fg.primary` |
| `.explorations__why` | font | `typography.body.1` |
| `.explorations__why` | letter-spacing | `typography.body.1` |
| `.explorations__why` | color | `semantic.*.fg.secondary` |
