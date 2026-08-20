# Content/Token Tiers

The token architecture of a multi-brand library, as a diagram you can operate:
one base component over three tiers of tokens, three brands underneath, and
the bottom tier resolving to whichever brand the reader picks.

BUILT RATHER THAN EXPORTED, which is the whole reason it exists. The picture
shipped first as a 1.3MB PNG on a near-white plate, and on a dark page that is
a lit panel in the middle of an article — the case `Media`'s `srcDark` exists
for, needing a second export that never landed. Drawn in elements, the chrome
takes the page's own tokens and the problem does not arise in either theme, at
any width, with nothing to download.

IT IS INTERACTIVE AND IT SHIPS NO JAVASCRIPT, which is the part worth copying.
The picker is three native radios and the resolution is `:has()` — so it works
with scripting off, arrow keys move between brands because that is what a
radio group does, and the page stays a prerendered document with no hydration
boundary in it. A React island here would have shipped a runtime to re-render
a picture that was already correct in the HTML, and put a running component
inside every Chromatic snapshot. The rule generalises: reach for state only
once the platform has actually run out.

The other split it keeps is the one from the still version. Everything the
diagram is MADE of — plates, rules, type, connectors — is a token reference,
so the component repaints with the brand pack like everything else on the
site. Everything the diagram is ABOUT — six greys, six semantic values, three
brand ramps — is data, because a picture of somebody else's palette that
repaints with yours has stopped being true. Bands are relative; the thing on
the wall is not.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/TokenTiers.tsx` and `src/components/TokenTiers.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `alt` | `string` | **yes** |
| `base` | `TokenTiersBase` | **yes** |
| `tiers` | `TokenTier[]` | **yes** |
| `note` | `string` | **yes** |
| `brands` | `TokenTierBrand[]` | **yes** |
| `sharedSemantic` | `TokenSwatch[]` | **yes** |
| `rowLabels` | `TokenTiersRowLabels` | **yes** |
| `pickerLegend` | `string` | **yes** |
| `defaultBrand` | `string` | no |
| `tint` | `string` | no |
| `caption` | `string` | no |
| `captionCopyRef` | `string` | no |

### Property notes

- `alt` The accessible name for the picture, and REQUIRED for the same reason `IconButton` requires `aria-label`. A picture built out of elements has no `alt` to forget, so it can ship with no text alternative at all and look finished — which is worse than a broken image, because nothing reports it. The stack takes `role="img"` and this string, so assistive technology is handed one description of the picture rather than eighty loose fragments of it in reading order.
- `base` The component every tier below resolves a value for.
- `tiers` Foundation, semantic, feature. Rendered in the order given.
- `note` The line under the stack, stating what the picture argues.
- `sharedSemantic` The semantic row, rendered identically under every brand. One array passed once, not one per brand. The diagram's claim is that these do not vary, and three lists that happen to agree would be that claim maintained by hand.
- `pickerLegend` The group name for the brand picker, announced before the three options. Visually hidden. On screen the three columns are self-evidently a set and the caption says what picking one does; announced, a radio with no group label is an answer with no question in front of it.
- `defaultBrand` Which brand is resolved on first paint, by name. None by default. The empty state is the honest one and it is what the static picture showed: the feature tier has nothing in it until a brand puts something there. This exists so a story can snapshot the resolved state, since Chromatic photographs a page rather than clicking through it.
- `tint` The depicted system's accent, used to wash the tinted tier. Passed down as `--tt-tint` and washed by the stylesheet rather than mixed here, because the hue is data and the strength is not: a dark violet washed straight onto a dark band measures 1.04:1 against it and simply disappears. The stylesheet shifts it toward `fg/primary` first, so the hue stays the depicted one and the lightness follows the theme. Omitting it leaves the middle tier an outline rather than turning it grey.
- `captionCopyRef` `<file>:<path>` into src/copy, making the caption editable in the browser under `npm run dev`. Dev tooling only; inert in a build.

## Don't

- Do not put a depicted colour in the stylesheet. Everything this diagram is made of is a token and everything it is about is data, and the moment another system's yellow lands in the CSS the published contract stops being true.
- Do not theme the swatches. The chrome flips with the page and the subject must not: a ramp that repaints with the reader's brand is no longer a picture of the ramp it claims to show.
- Never render the depicted button as a real button. It is a picture of a control, so an interactive element there is a tab stop that does nothing and an announcement that lies.
- Do not drop the alt. The picture is built from elements, so there is no missing image to notice — an undescribed diagram ships looking finished and nothing reports it.
- Do not make it an island. The picker is native radios and `:has()`, which works with scripting off and keeps a prerendered article free of a hydration boundary; a state hook here ships a runtime to re-render a picture that was already correct in the HTML.
- Never put `role="img"` over the picker. It labels the STACK, which is a picture; a radio inside a region announced as an image is a control assistive technology has been told to ignore.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.token-tiers` | gap | `primitive.space.sp400` |
| `.token-tiers__diagram` | --tt-tint-shifted | `--tt-tint` (local property, not a token) |
| `.token-tiers__diagram` | --tt-tint-shifted | `semantic.*.fg.primary` |
| `.token-tiers__diagram` | --tt-selected-shifted | `--tt-selected` (local property, not a token) |
| `.token-tiers__diagram` | --tt-selected-shifted | `semantic.*.fg.primary` |
| `.token-tiers__diagram` | --tt-selected-edge | `--tt-selected` (local property, not a token) |
| `.token-tiers__diagram` | --tt-selected-edge | `semantic.*.fg.primary` |
| `.token-tiers__base` | gap | `primitive.space.sp150` |
| `.token-tiers__base` | padding | `primitive.space.sp500` |
| `.token-tiers__base` | padding | `primitive.space.sp1000` |
| `.token-tiers__base` | border | `semantic.*.fg.primary` |
| `.token-tiers__base` | border-radius | `primitive.radius.r12` |
| `.token-tiers__base` | transition | `semantic.*.duration.dropdown` |
| `.token-tiers__base` | transition | `semantic.*.easing.out` |
| `.token-tiers__eyebrow` | font | `typography.emphasis.4` |
| `.token-tiers__eyebrow` | letter-spacing | `typography.emphasis.4` |
| `.token-tiers__base-name` | font | `typography.heading.m` |
| `.token-tiers__base-name` | letter-spacing | `typography.heading.m` |
| `@media (min-width: 768px) { .token-tiers__base-name }` | font | `typography.heading.l` |
| `@media (min-width: 768px) { .token-tiers__base-name }` | letter-spacing | `typography.heading.l` |
| `.token-tiers__drop` | height | `primitive.space.sp800` |
| `.token-tiers__drop` | background | `semantic.*.border.strong` |
| `.token-tiers__drop::after` | width | `primitive.size.s6` |
| `.token-tiers__drop::after` | height | `primitive.size.s6` |
| `.token-tiers__drop::after` | border-radius | `primitive.radius.round` |
| `.token-tiers__drop::after` | background | `semantic.*.fg.primary` |
| `.token-tiers__tier` | gap | `primitive.space.sp600` |
| `.token-tiers__tier` | padding | `primitive.space.sp600` |
| `.token-tiers__tier` | border-radius | `primitive.radius.r16` |
| `@media (min-width: 768px) { .token-tiers__tier }` | padding | `primitive.space.sp600` |
| `@media (min-width: 768px) { .token-tiers__tier }` | padding | `primitive.space.sp1000` |
| `.token-tiers__tier[data-weight='tinted']` | border | `semantic.*.border.default` |
| `.token-tiers__diagram[data-tinted] .token-tiers__tier[data-weight='tinted']` | background | `--tt-tint-shifted` (local property, not a token) |
| `.token-tiers__tier[data-weight='outline']` | border | `semantic.*.border.default` |
| `.token-tiers__tier-label` | column-gap | `primitive.space.sp500` |
| `.token-tiers__tier-label` | row-gap | `primitive.space.sp100` |
| `.token-tiers__glyph` | width | `primitive.size.s32` |
| `.token-tiers__glyph` | height | `primitive.size.s32` |
| `.token-tiers__tier-title` | font | `typography.emphasis.2` |
| `.token-tiers__tier-title` | letter-spacing | `typography.emphasis.2` |
| `.token-tiers__tier-gloss` | font | `typography.body.2` |
| `.token-tiers__tier-gloss` | letter-spacing | `typography.body.2` |
| `.token-tiers__swatches` | gap | `primitive.space.sp500` |
| `.token-tiers__swatches[data-row='mini']` | gap | `primitive.space.sp300` |
| `.token-tiers__swatch` | gap | `primitive.space.sp300` |
| `.token-tiers__dot` | border-radius | `primitive.radius.round` |
| `.token-tiers__swatch[data-size='tier'] .token-tiers__dot` | width | `primitive.size.s40` |
| `.token-tiers__swatch[data-size='tier'] .token-tiers__dot` | height | `primitive.size.s40` |
| `.token-tiers__swatch[data-size='mini'] .token-tiers__dot` | width | `primitive.size.s24` |
| `.token-tiers__swatch[data-size='mini'] .token-tiers__dot` | height | `primitive.size.s24` |
| `.token-tiers__swatch-label` | font | `typography.body.3` |
| `.token-tiers__swatch-label` | letter-spacing | `typography.body.3` |
| `.token-tiers__swatch-value` | font | `typography.body.3` |
| `.token-tiers__swatch-value` | letter-spacing | `typography.body.3` |
| `.token-tiers__note` | margin | `primitive.layout.l40` |
| `.token-tiers__note` | font | `typography.emphasis.3` |
| `.token-tiers__note` | letter-spacing | `typography.emphasis.3` |
| `@media (min-width: 768px) { .token-tiers__fan }` | height | `primitive.layout.l40` |
| `@media (min-width: 768px) { .token-tiers__fan }` | margin | `primitive.space.sp1000` |
| `@media (min-width: 768px) { .token-tiers__fan }` | border | `semantic.*.border.strong` |
| `@media (min-width: 768px) { .token-tiers__fan }` | border-start-start-radius | `primitive.radius.r8` |
| `@media (min-width: 768px) { .token-tiers__fan }` | border-start-end-radius | `primitive.radius.r8` |
| `@media (min-width: 768px) { .token-tiers__fan::before,
  .token-tiers__fan::after }` | background | `semantic.*.border.strong` |
| `@media (min-width: 768px) { .token-tiers__fan::before }` | height | `primitive.space.sp600` |
| `.token-tiers__brands` | margin | `primitive.layout.l40` |
| `.token-tiers__brands` | gap | `primitive.layout.l40` |
| `@media (min-width: 768px) { .token-tiers__brands }` | margin-block-start | `primitive.space.sp600` |
| `.token-tiers__brand` | --tt-accent-shifted | `--tt-accent` (local property, not a token) |
| `.token-tiers__brand` | --tt-accent-shifted | `semantic.*.fg.primary` |
| `.token-tiers__brand` | --tt-accent-edge | `--tt-accent` (local property, not a token) |
| `.token-tiers__brand` | --tt-accent-edge | `semantic.*.fg.primary` |
| `.token-tiers__brand` | gap | `primitive.space.sp600` |
| `.token-tiers__brand` | padding | `primitive.space.sp500` |
| `.token-tiers__brand` | border-radius | `primitive.radius.r16` |
| `.token-tiers__brand` | transition | `semantic.*.duration.dropdown` |
| `.token-tiers__brand` | transition | `semantic.*.easing.out` |
| `.token-tiers__brand` | transition | `semantic.*.duration.dropdown` |
| `.token-tiers__brand` | transition | `semantic.*.easing.out` |
| `@media (min-width: 768px) { .token-tiers__brand + .token-tiers__brand::before }` | inset-block | `primitive.space.sp500` |
| `@media (min-width: 768px) { .token-tiers__brand + .token-tiers__brand::before }` | background | `semantic.*.border.default` |
| `@media (min-width: 768px) { .token-tiers__brand + .token-tiers__brand::before }` | transition | `semantic.*.duration.dropdown` |
| `@media (min-width: 768px) { .token-tiers__brand + .token-tiers__brand::before }` | transition | `semantic.*.easing.out` |
| `.token-tiers__brand-head` | gap | `primitive.space.sp500` |
| `.token-tiers__brand-mark` | width | `primitive.size.s40` |
| `.token-tiers__brand-mark` | height | `primitive.size.s40` |
| `.token-tiers__brand-mark` | border-radius | `primitive.radius.r8` |
| `.token-tiers__brand-name` | font | `typography.heading.s` |
| `.token-tiers__brand-name` | letter-spacing | `typography.heading.s` |
| `.token-tiers__brand-row` | gap | `primitive.space.sp400` |
| `.token-tiers__brand-row` | padding-block-start | `primitive.space.sp500` |
| `.token-tiers__brand-row` | border-block-start | `semantic.*.border.default` |
| `.token-tiers__brand-label` | font | `typography.body.3` |
| `.token-tiers__brand-label` | letter-spacing | `typography.body.3` |
| `.token-tiers__button` | min-height | `primitive.size.button-lg` |
| `.token-tiers__button` | padding-inline | `primitive.space.sp1000` |
| `.token-tiers__button` | border-radius | `primitive.radius.round` |
| `.token-tiers__button` | font | `typography.emphasis.1` |
| `.token-tiers__button` | letter-spacing | `typography.emphasis.1` |
| `.token-tiers__caption` | color | `semantic.*.fg.secondary` |
| `.token-tiers__caption` | font | `typography.body.3` |
| `.token-tiers__caption` | letter-spacing | `typography.body.3` |
| `.token-tiers__value-set` | transition | `semantic.*.duration.dropdown` |
| `.token-tiers__value-set` | transition | `semantic.*.easing.out` |
| `.token-tiers__diagram:has(.token-tiers__brand[data-index='0'] .token-tiers__radio:checked)` | --tt-selected | `--tt-accent-0` (local property, not a token) |
| `.token-tiers__diagram:has(.token-tiers__brand[data-index='1'] .token-tiers__radio:checked)` | --tt-selected | `--tt-accent-1` (local property, not a token) |
| `.token-tiers__diagram:has(.token-tiers__brand[data-index='2'] .token-tiers__radio:checked)` | --tt-selected | `--tt-accent-2` (local property, not a token) |
| `.token-tiers__tier[data-resolves]` | transition | `semantic.*.duration.dropdown` |
| `.token-tiers__tier[data-resolves]` | transition | `semantic.*.easing.out` |
| `.token-tiers__tier[data-resolves]` | transition | `semantic.*.duration.dropdown` |
| `.token-tiers__tier[data-resolves]` | transition | `semantic.*.easing.out` |
| `.token-tiers__diagram:has(.token-tiers__radio:checked) .token-tiers__tier[data-resolves]` | background | `--tt-selected-shifted` (local property, not a token) |
| `.token-tiers__diagram:has(.token-tiers__radio:checked) .token-tiers__tier[data-resolves]` | border-color | `--tt-selected-edge` (local property, not a token) |
| `.token-tiers__diagram:has(.token-tiers__radio:checked) .token-tiers__base` | border-color | `--tt-selected-edge` (local property, not a token) |
| `.token-tiers__brand:has(.token-tiers__radio:checked)` | background | `--tt-accent-shifted` (local property, not a token) |
| `.token-tiers__brand:has(.token-tiers__radio:checked)` | outline | `--tt-accent-edge` (local property, not a token) |
| `.token-tiers__brand:has(.token-tiers__radio:focus-visible)` | outline | `semantic.*.border.focus` |
