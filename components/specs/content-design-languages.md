# Content/Design Languages

What four design languages actually amounted to, measured out of the real
foundation files rather than remembered.

IT ILLUSTRATES A REJECTED EXPLORATION, which decides its shape. The reader has
just been told the original plan built each brand's identity into the
components themselves, and that it proved far more complex than the early
assessment suggested. This is why: a brand's identity is a handful of values
and a typeface, sitting on top of a foundation the brands declare identically,
so building the identity in meant carrying a copy of the shared part per
brand. The control does exactly that and the duplication is the cost.

THE VALUES ARE SOURCED AND THEREFORE ABSOLUTE. They are Expedia's, Hotels.com's
and Vrbo's own, read from the live Figma file — so, like the token-tiers figure
next door, they must survive a theme change unmoved. Everything the diagram is
MADE of is a token and everything it is ABOUT is data; a picture of somebody
else's palette that repaints with yours has stopped being true.

Interactive with no JavaScript, on the same mechanism as the other three: one
native checkbox and `:has()`.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/DesignLanguages.tsx` and `src/components/DesignLanguages.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `alt` | `string` | **yes** |
| `languages` | `DesignLanguage[]` | **yes** |
| `shared` | `SharedRamp[]` | **yes** |
| `ledger` | `DesignLanguagesLedger` | **yes** |
| `labels` | `DesignLanguagesLabels` | **yes** |
| `defaultDuplicated` | `boolean` | no |
| `caption` | `string` | no |
| `captionCopyRef` | `string` | no |

### Property notes

- `alt` The accessible name for the whole figure, and REQUIRED for the same reason the other diagrams require one: a picture built from elements has no missing image for anyone to notice. It carries the counts, because the argument here is an amount — how much of four design languages turns out to be one design language.
- `languages` The brands, left to right.
- `shared` The ramps every brand declares identically. The mass of the picture.
- `ledger` Computed in the data file from the variable dumps, never typed.
- `defaultDuplicated` Start with the shared set duplicated into every brand. Off by default, because what shipped is the honest resting state. It exists so a story can snapshot the second state, since Chromatic photographs a page rather than operating one.

## Don't

- Do not put a depicted value in the stylesheet. These are three other companies' brand colours, read from their foundation files; the moment one lands in CSS the published contract stops being true and the swatch repaints with whichever brand is showing.
- Do not render EGDS token names. A reader outside Expedia learns nothing from an internal namespace, and publishing one out of a private file is the disclosure this study cuts everywhere else. The labels are plain English for the same slot.
- Do not set a type specimen in a substitute face. Reckless XPD, Recoleta and Lardent Pro Slab are licensed and absent here, so an "Aa" would show three faces EGDS does not ship — the same rule as a hand-traced logo being a wrong logo. Name the face.
- Do not round the ledger. 84 shared and 10 differing do not sum to the union, because 83 more are declared by one or two brands and inherited by the rest; folding those into either number is the flattering version.
- Do not build the duplicated copies on click. They are rendered in every brand and revealed by CSS, which is what keeps a prerendered article free of a runtime for a picture.
- Never put `role="img"` over the control. It labels the PLATE, which is a picture; a checkbox inside a region announced as an image is a control assistive technology has been told to skip.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.design-languages` | gap | `primitive.space.sp400` |
| `.design-languages__figure` | gap | `primitive.space.sp600` |
| `.design-languages__toggle-label` | gap | `primitive.space.sp300` |
| `.design-languages__toggle-label` | padding | `primitive.space.sp200` |
| `.design-languages__toggle-label` | padding | `primitive.space.sp500` |
| `.design-languages__toggle-label` | border | `semantic.*.border.default` |
| `.design-languages__toggle-label` | border-radius | `primitive.radius.round` |
| `.design-languages__toggle-label` | font | `typography.emphasis.3` |
| `.design-languages__toggle-label` | letter-spacing | `typography.emphasis.3` |
| `.design-languages__toggle-label` | color | `semantic.*.fg.primary` |
| `.design-languages__toggle-label` | transition | `semantic.*.duration.dropdown` |
| `.design-languages__toggle-label` | transition | `semantic.*.easing.out` |
| `.design-languages__toggle-label` | transition | `semantic.*.duration.dropdown` |
| `.design-languages__toggle-label` | transition | `semantic.*.easing.out` |
| `.design-languages__toggle-label::before` | width | `primitive.size.s8` |
| `.design-languages__toggle-label::before` | height | `primitive.size.s8` |
| `.design-languages__toggle-label::before` | border-radius | `primitive.radius.round` |
| `.design-languages__toggle-label::before` | transition | `semantic.*.duration.dropdown` |
| `.design-languages__toggle-label::before` | transition | `semantic.*.easing.out` |
| `.design-languages__toggle:checked + .design-languages__toggle-label` | background | `semantic.*.status.warning` |
| `.design-languages__toggle:checked + .design-languages__toggle-label` | border-color | `semantic.*.status.warning` |
| `.design-languages__toggle:checked + .design-languages__toggle-label` | border-color | `semantic.*.fg.primary` |
| `.design-languages__toggle:checked + .design-languages__toggle-label::before` | background | `semantic.*.status.warning` |
| `.design-languages__toggle:checked + .design-languages__toggle-label::before` | background | `semantic.*.fg.primary` |
| `.design-languages__toggle:focus-visible + .design-languages__toggle-label` | outline | `semantic.*.border.focus` |
| `.design-languages__plate` | gap | `primitive.space.sp600` |
| `.design-languages__brands` | gap | `primitive.space.sp600` |
| `.design-languages__brand` | gap | `primitive.space.sp400` |
| `.design-languages__brand` | padding | `primitive.space.sp400` |
| `.design-languages__brand` | border | `semantic.*.border.default` |
| `.design-languages__brand` | border-radius | `primitive.radius.r12` |
| `.design-languages__name` | font | `typography.emphasis.4` |
| `.design-languages__name` | letter-spacing | `typography.emphasis.4` |
| `.design-languages__name` | color | `semantic.*.fg.primary` |
| `.design-languages__own` | gap | `primitive.space.sp300` |
| `.design-languages__own-row` | grid-template-columns | `primitive.size.s20` |
| `.design-languages__own-row` | gap | `primitive.space.sp300` |
| `.design-languages__swatch` | width | `primitive.size.s20` |
| `.design-languages__swatch` | height | `primitive.size.s20` |
| `.design-languages__swatch` | border-radius | `primitive.radius.r4` |
| `.design-languages__own-label` | font | `typography.body.3` |
| `.design-languages__own-label` | letter-spacing | `typography.body.3` |
| `.design-languages__own-label` | color | `semantic.*.fg.secondary` |
| `.design-languages__value` | font | `typography.emphasis.4` |
| `.design-languages__value` | letter-spacing | `typography.emphasis.4` |
| `.design-languages__value` | color | `semantic.*.fg.primary` |
| `.design-languages__face` | gap | `primitive.space.sp200` |
| `.design-languages__face` | font | `typography.emphasis.4` |
| `.design-languages__face` | letter-spacing | `typography.emphasis.4` |
| `.design-languages__face` | color | `semantic.*.fg.primary` |
| `.design-languages__own-row[data-kind='note'] .design-languages__face-note` | font | `typography.body.3` |
| `.design-languages__own-row[data-kind='note'] .design-languages__face-note` | letter-spacing | `typography.body.3` |
| `.design-languages__own-row[data-kind='note'] .design-languages__face-note` | color | `semantic.*.fg.secondary` |
| `.design-languages__ramps` | gap | `primitive.space.sp200` |
| `.design-languages__ramp` | gap | `primitive.space.sp100` |
| `.design-languages__ramp-label` | font | `typography.body.3` |
| `.design-languages__ramp-label` | letter-spacing | `typography.body.3` |
| `.design-languages__ramp-label` | color | `semantic.*.fg.primary` |
| `.design-languages__ramp-steps` | gap | `primitive.space.sp50` |
| `.design-languages__step` | height | `primitive.size.s16` |
| `.design-languages__step` | border-radius | `primitive.radius.r2` |
| `.design-languages__copy` | transition | `semantic.*.duration.overlay` |
| `.design-languages__copy` | transition | `semantic.*.easing.out` |
| `.design-languages__shared` | gap | `primitive.space.sp400` |
| `.design-languages__shared` | padding | `primitive.space.sp500` |
| `.design-languages__shared` | border-radius | `primitive.radius.r12` |
| `.design-languages__shared` | background | `semantic.*.fg.accent` |
| `.design-languages__shared` | border | `semantic.*.fg.accent` |
| `.design-languages__shared` | border | `semantic.*.fg.primary` |
| `@media (min-width: 760px) { .design-languages__shared .design-languages__ramps }` | gap | `primitive.space.sp400` |
| `@media (min-width: 760px) { .design-languages__shared .design-languages__ramps }` | gap | `primitive.layout.l40` |
| `.design-languages__shared-label` | font | `typography.body.3` |
| `.design-languages__shared-label` | letter-spacing | `typography.body.3` |
| `.design-languages__shared-label` | color | `semantic.*.fg.primary` |
| `.design-languages__caption` | color | `semantic.*.fg.secondary` |
| `.design-languages__caption` | font | `typography.body.3` |
| `.design-languages__caption` | letter-spacing | `typography.body.3` |
