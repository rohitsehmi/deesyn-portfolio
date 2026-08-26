# Content/Component Models

The rebuild that was abandoned partway through, drawn beside the thing that
replaced it: four design languages inside every component, against one base
component with brand tokens on top.

IT ILLUSTRATES A REJECTED EXPLORATION, which decides its shape, the same way
the governance ladder's shape follows from illustrating one. The reader has
just been told that every component carried four sets of decisions and that
every later change had to be correct in four places at once. That sentence is
a count, and a count is a thing to show rather than a thing to say, so the
control marks the row a change lands on and the reader finds it four times on
the left and once on the right.

THE FIDELITY COST IS DRAWN TOO, and it has to be. The exploration admits in
words that the pivot cost some fidelity, and a picture where the right-hand
model is all upside would be arguing with the paragraph beside it. So exactly
one decision moves out to the brand chips: what shipped lets a brand differ on
how a component looks and not on how it is built, and that is visible before
anybody touches the control.

NO COLOUR OF ITS OWN, like the governance figure and unlike the token-tiers
one. This depicts a structure rather than somebody else's palette, so every
tone is a token, it repaints with the brand pack, and both themes come out
right without a second export or a second set of values.

Interactive with no JavaScript, on the same mechanism: one native checkbox and
`:has()`. `:has()` is what makes it possible at all, since the thing being
marked sits below the control in the document but the marks are spread across
two columns that `~` could never reach into.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/ComponentModels.tsx` and `src/components/ComponentModels.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `alt` | `string` | **yes** |
| `subject` | `string` | **yes** |
| `languages` | `string[]` | **yes** |
| `decisions` | `ComponentDecision[]` | **yes** |
| `models` | `{ abandoned: ComponentModelLabels; shipped: ComponentModelLabels }` | **yes** |
| `base` | `string` | **yes** |
| `change` | `ComponentModelsChange` | no |
| `defaultChanged` | `boolean` | no |
| `caption` | `string` | no |
| `captionCopyRef` | `string` | no |

### Property notes

- `alt` The accessible name for the whole figure, and REQUIRED for the same reason `IconButton` requires `aria-label` and the other two diagrams require `alt`. It carries more weight here than on either of them, because the argument this picture makes is a COUNT: four marks on the left against one on the right. A sighted reader counts them; the alt has to say the number.
- `subject` The component the picture is drawn about. "Date picker".
- `languages` The four design languages, left to right and top to bottom.
- `decisions` What a component carries. One of them is `perBrand`, which is what moves to the right-hand model's token chips, and one is `changes`, which is what the control marks.
- `models` The two headers. Abandoned first: it was the plan first.
- `base` The eyebrow on the shipped component, naming whose component it is.
- `change` The change, as a control rather than a caption. Optional: without it the figure is the two structures and nothing else, which is the right thing to render anywhere the cost of a change is not the subject.
- `defaultChanged` Start with the change showing. Off by default, because the structures are the honest resting state and the count is what a reader goes looking for. It exists so a story can snapshot the second state, since Chromatic photographs a page rather than operating one — the same reason `GovernanceTiers` takes a `defaultRejected`.
- `captionCopyRef` `<file>:<path>` into src/copy, making the caption editable in the browser under `npm run dev`. Dev tooling only; inert in a build.

## Don't

- Do not mix a wash with a band token. `color-mix(<token> n%, var(--semantic-band-sunken))` paints one specific band's fill, and this figure ships on a base band and renders against all four in Storybook. Mix with `transparent` so the wash composites over whatever it lands on.
- Do not mark a change to the look. It lands in one place per brand in both models, so marking it shows two structures agreeing and proves nothing. The comparison only works on a decision the shipped model holds once.
- Do not draw the shipped model as all upside. The exploration admits in words that the pivot cost fidelity, so exactly one decision has to move out to the brand chips; a picture without it argues with the paragraph beside it.
- Do not let the marked row change size. It takes a border when marked, so an unmarked row reserves a transparent one; without it every row in the figure shifts a pixel and the diagram reads as twitching.
- Do not label every mark. Five copies of the same two words read as part of the structure rather than as an annotation on it, and the control above already names what is being changed.
- Never let the toggle be anything but a real checkbox. The space bar, the focus ring and the announced state come free from the browser, and a div with a click handler has none of them.
- Never put `role="img"` over the control. It labels the two MODELS, which are a picture; a checkbox inside a region announced as an image is a control assistive technology has been told to skip.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.component-models` | gap | `primitive.space.sp400` |
| `.component-models__figure` | gap | `primitive.space.sp600` |
| `.component-models__toggle-label` | gap | `primitive.space.sp300` |
| `.component-models__toggle-label` | padding | `primitive.space.sp200` |
| `.component-models__toggle-label` | padding | `primitive.space.sp500` |
| `.component-models__toggle-label` | border | `semantic.*.border.default` |
| `.component-models__toggle-label` | border-radius | `primitive.radius.round` |
| `.component-models__toggle-label` | font | `typography.emphasis.3` |
| `.component-models__toggle-label` | letter-spacing | `typography.emphasis.3` |
| `.component-models__toggle-label` | color | `semantic.*.fg.primary` |
| `.component-models__toggle-label` | transition | `semantic.*.duration.dropdown` |
| `.component-models__toggle-label` | transition | `semantic.*.easing.out` |
| `.component-models__toggle-label` | transition | `semantic.*.duration.dropdown` |
| `.component-models__toggle-label` | transition | `semantic.*.easing.out` |
| `.component-models__toggle-label::before` | width | `primitive.size.s8` |
| `.component-models__toggle-label::before` | height | `primitive.size.s8` |
| `.component-models__toggle-label::before` | border-radius | `primitive.radius.round` |
| `.component-models__toggle-label::before` | transition | `semantic.*.duration.dropdown` |
| `.component-models__toggle-label::before` | transition | `semantic.*.easing.out` |
| `.component-models__toggle:checked + .component-models__toggle-label` | background | `semantic.*.fg.accent` |
| `.component-models__toggle:checked + .component-models__toggle-label` | border-color | `semantic.*.fg.accent` |
| `.component-models__toggle:checked + .component-models__toggle-label` | border-color | `semantic.*.fg.primary` |
| `.component-models__toggle:checked + .component-models__toggle-label::before` | background | `semantic.*.fg.accent` |
| `.component-models__toggle:checked + .component-models__toggle-label::before` | background | `semantic.*.fg.primary` |
| `.component-models__toggle:focus-visible + .component-models__toggle-label` | outline | `semantic.*.border.focus` |
| `.component-models__models` | gap | `primitive.layout.l48` |
| `@media (min-width: 800px) { .component-models__models }` | gap | `primitive.layout.l40` |
| `@media (min-width: 800px) { .component-models__model + .component-models__model }` | padding-inline-start | `primitive.layout.l40` |
| `@media (min-width: 800px) { .component-models__model + .component-models__model }` | border-inline-start | `semantic.*.border.default` |
| `.component-models__model` | gap | `primitive.space.sp500` |
| `.component-models__header` | gap | `primitive.space.sp100` |
| `.component-models__label` | font | `typography.emphasis.4` |
| `.component-models__label` | letter-spacing | `typography.emphasis.4` |
| `.component-models__label` | color | `semantic.*.fg.primary` |
| `.component-models__gloss` | font | `typography.body.3` |
| `.component-models__gloss` | letter-spacing | `typography.body.3` |
| `.component-models__gloss` | color | `semantic.*.fg.secondary` |
| `.component-models__block` | gap | `primitive.space.sp400` |
| `.component-models__block` | padding | `primitive.space.sp400` |
| `.component-models__block` | border | `semantic.*.border.strong` |
| `.component-models__block` | border-radius | `primitive.radius.r12` |
| `.component-models__block-label` | gap | `primitive.space.sp300` |
| `.component-models__block-label` | font | `typography.emphasis.3` |
| `.component-models__block-label` | letter-spacing | `typography.emphasis.3` |
| `.component-models__block-label` | color | `semantic.*.fg.primary` |
| `.component-models__block-eyebrow` | font | `typography.body.3` |
| `.component-models__block-eyebrow` | letter-spacing | `typography.body.3` |
| `.component-models__block-eyebrow` | color | `semantic.*.fg.secondary` |
| `.component-models__languages` | gap | `primitive.space.sp300` |
| `.component-models__language` | gap | `primitive.space.sp200` |
| `.component-models__language` | padding | `primitive.space.sp300` |
| `.component-models__language` | border | `semantic.*.border.default` |
| `.component-models__language` | border-radius | `primitive.radius.r8` |
| `.component-models__language-label` | font | `typography.emphasis.4` |
| `.component-models__language-label` | letter-spacing | `typography.emphasis.4` |
| `.component-models__language-label` | color | `semantic.*.fg.primary` |
| `.component-models__tokens` | gap | `primitive.space.sp300` |
| `.component-models__token` | gap | `primitive.space.sp200` |
| `.component-models__token` | padding | `primitive.space.sp300` |
| `.component-models__token` | border-radius | `primitive.radius.r8` |
| `.component-models__token` | background | `semantic.*.bg.widget` |
| `.component-models__token .component-models__decision` | color | `semantic.*.fg.primary` |
| `.component-models__feed` | height | `primitive.space.sp600` |
| `.component-models__feed` | height | `primitive.space.sp500` |
| `.component-models__feed` | margin-block | `primitive.space.sp500` |
| `.component-models__feed` | background | `semantic.*.border.strong` |
| `.component-models__decisions` | gap | `primitive.space.sp50` |
| `.component-models__decision` | gap | `primitive.space.sp200` |
| `.component-models__decision` | padding | `primitive.space.sp50` |
| `.component-models__decision` | padding | `primitive.space.sp200` |
| `.component-models__decision` | border-radius | `primitive.radius.r4` |
| `.component-models__decision` | font | `typography.body.3` |
| `.component-models__decision` | letter-spacing | `typography.body.3` |
| `.component-models__decision` | color | `semantic.*.fg.secondary` |
| `.component-models__decision` | transition | `semantic.*.duration.dropdown` |
| `.component-models__decision` | transition | `semantic.*.easing.out` |
| `.component-models__decision` | transition | `semantic.*.duration.dropdown` |
| `.component-models__decision` | transition | `semantic.*.easing.out` |
| `.component-models__decision` | transition | `semantic.*.duration.dropdown` |
| `.component-models__decision` | transition | `semantic.*.easing.out` |
| `.component-models__decision::before` | width | `primitive.space.sp200` |
| `.component-models__decision::before` | height | `primitive.space.sp200` |
| `.component-models__decision::before` | border-radius | `primitive.radius.round` |
| `.component-models__decision::before` | border | `semantic.*.border.strong` |
| `.component-models__decision::before` | transition | `semantic.*.duration.dropdown` |
| `.component-models__decision::before` | transition | `semantic.*.easing.out` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]` | background | `semantic.*.fg.accent` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]` | border-color | `semantic.*.fg.accent` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]` | border-color | `semantic.*.fg.primary` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]` | color | `semantic.*.fg.primary` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]::before` | background | `semantic.*.fg.accent` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]::before` | background | `semantic.*.fg.primary` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]::before` | border-color | `semantic.*.fg.accent` |
| `.component-models__figure:has(.component-models__toggle:checked)
  .component-models__decision[data-changes]::before` | border-color | `semantic.*.fg.primary` |
| `.component-models__caption` | color | `semantic.*.fg.secondary` |
| `.component-models__caption` | font | `typography.body.3` |
| `.component-models__caption` | letter-spacing | `typography.body.3` |
