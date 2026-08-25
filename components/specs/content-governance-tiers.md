# Content/Governance Tiers

How a component earned its way into the shared library: three tiers, three
gates, and the route that was rejected drawn straight through all of them.

IT ILLUSTRATES A REJECTED EXPLORATION, which decides its shape. The reader has
just been told that letting any team push into core is the fastest way to
fill a core library with components only one team can maintain. So the figure
shows the ladder that shipped, and the control removes the gates rather than
describing their absence: the rejected model IS this picture with three things
taken out of it, and that is a thing to show rather than a thing to say.

NO COLOUR OF ITS OWN. Unlike the token-tiers figure beside it, this depicts a
process rather than somebody else's palette, so there is nothing here that has
to stay absolute. Every tone is a token, it repaints with the brand pack, and
both themes come out right without a second export or a second set of values.

Interactive with no JavaScript, on the same mechanism: one native checkbox and
`:has()`. A page that ships no runtime for a diagram can afford to have the
diagram do something.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/GovernanceTiers.tsx` and `src/components/GovernanceTiers.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `alt` | `string` | **yes** |
| `stages` | `GovernanceStage[]` | **yes** |
| `tiers` | `GovernanceTiersLabels` | **yes** |
| `rejected` | `GovernanceTiersRejected` | no |
| `defaultRejected` | `boolean` | no |
| `caption` | `string` | no |
| `captionCopyRef` | `string` | no |

### Property notes

- `alt` The accessible name for the whole figure, and REQUIRED for the same reason `IconButton` requires `aria-label` and `TokenTiers` requires `alt`. A picture built from elements has no missing image for anyone to notice, so an undescribed one ships looking finished and nothing reports it.
- `stages` Team, shared, core. Rendered in the order given, left to right.
- `tiers` The three tier names, drawn on every panel.
- `rejected` The rejected model, as a control rather than a caption. Optional: without it the figure is the shipped ladder and nothing else, which is the right thing to render anywhere the rejected path is not the subject.
- `defaultRejected` Start with the rejected path showing. Off by default, because the shipped ladder is the honest resting state. It exists so a story can snapshot the second state, since Chromatic photographs a page rather than operating one — the same reason `TokenTiers` takes a `defaultBrand`.
- `captionCopyRef` `<file>:<path>` into src/copy, making the caption editable in the browser under `npm run dev`. Dev tooling only; inert in a build.

## Don't

- Do not dim the gates to show them removed. Reducing opacity takes the one element whose whole job is to be read under AA; a strike says removed at full contrast.
- Do not use status/danger raw for the rejected route. It measures 2.94:1 on a light band and 5.23:1 on a dark one, so it fails AA in exactly one theme, which is the kind of bug that survives review. Mix it toward fg/primary first.
- Do not give the bypass a label on every panel. Three copies of the same two words is not emphasis, and the control above already names the route.
- Do not add a caption per panel where prose already sits beside the figure. An exploration states its reasoning in full next to this; a caption repeats the argument at a smaller size.
- Never let the toggle be anything but a real checkbox. The space bar, the focus ring and the announced state come free from the browser, and a div with a click handler has none of them.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.governance-tiers` | gap | `primitive.space.sp400` |
| `.governance-tiers__figure` | gap | `primitive.space.sp600` |
| `.governance-tiers__toggle-label` | gap | `primitive.space.sp300` |
| `.governance-tiers__toggle-label` | padding | `primitive.space.sp200` |
| `.governance-tiers__toggle-label` | padding | `primitive.space.sp500` |
| `.governance-tiers__toggle-label` | border | `semantic.*.border.default` |
| `.governance-tiers__toggle-label` | border-radius | `primitive.radius.round` |
| `.governance-tiers__toggle-label` | font | `typography.emphasis.3` |
| `.governance-tiers__toggle-label` | letter-spacing | `typography.emphasis.3` |
| `.governance-tiers__toggle-label` | color | `semantic.*.fg.primary` |
| `.governance-tiers__toggle-label` | transition | `semantic.*.duration.dropdown` |
| `.governance-tiers__toggle-label` | transition | `semantic.*.easing.out` |
| `.governance-tiers__toggle-label` | transition | `semantic.*.duration.dropdown` |
| `.governance-tiers__toggle-label` | transition | `semantic.*.easing.out` |
| `.governance-tiers__toggle-label::before` | width | `primitive.size.s8` |
| `.governance-tiers__toggle-label::before` | height | `primitive.size.s8` |
| `.governance-tiers__toggle-label::before` | border-radius | `primitive.radius.round` |
| `.governance-tiers__toggle-label::before` | transition | `semantic.*.duration.dropdown` |
| `.governance-tiers__toggle-label::before` | transition | `semantic.*.easing.out` |
| `.governance-tiers__toggle:checked + .governance-tiers__toggle-label` | background | `semantic.*.status.danger` |
| `.governance-tiers__toggle:checked + .governance-tiers__toggle-label` | border-color | `semantic.*.status.danger` |
| `.governance-tiers__toggle:checked + .governance-tiers__toggle-label` | border-color | `semantic.*.fg.primary` |
| `.governance-tiers__toggle:checked + .governance-tiers__toggle-label::before` | background | `semantic.*.status.danger` |
| `.governance-tiers__toggle:checked + .governance-tiers__toggle-label::before` | background | `semantic.*.fg.primary` |
| `.governance-tiers__toggle:focus-visible + .governance-tiers__toggle-label` | outline | `semantic.*.border.focus` |
| `.governance-tiers__stages` | gap | `primitive.layout.l48` |
| `@media (min-width: 760px) { .governance-tiers__stages }` | gap | `primitive.layout.l40` |
| `.governance-tiers__stage` | gap | `primitive.space.sp600` |
| `.governance-tiers__stage` | padding-inline | `primitive.space.sp300` |
| `@media (min-width: 760px) { .governance-tiers__stage + .governance-tiers__stage }` | border-inline-start | `semantic.*.border.default` |
| `.governance-tiers__stage-label` | font | `typography.emphasis.4` |
| `.governance-tiers__stage-label` | letter-spacing | `typography.emphasis.4` |
| `.governance-tiers__stage-label` | color | `semantic.*.fg.primary` |
| `.governance-tiers__tree` | --gt-gate-drop | `primitive.space.sp400` |
| `.governance-tiers__tree` | padding-inline-end | `primitive.space.sp800` |
| `.governance-tiers__tree` | padding-block-end | `--gt-gate-drop` (local property, not a token) |
| `.governance-tiers__link` | height | `primitive.space.sp600` |
| `.governance-tiers__link` | background | `semantic.*.border.strong` |
| `.governance-tiers__fork` | height | `primitive.space.sp600` |
| `.governance-tiers__fork` | border | `semantic.*.border.strong` |
| `.governance-tiers__fork` | border-end-start-radius | `primitive.radius.r8` |
| `.governance-tiers__fork` | border-end-end-radius | `primitive.radius.r8` |
| `.governance-tiers__fork::before` | height | `primitive.space.sp400` |
| `.governance-tiers__fork::before` | margin-block-start | `primitive.space.sp400` |
| `.governance-tiers__fork::before` | background | `semantic.*.border.strong` |
| `.governance-tiers__teams` | gap | `primitive.space.sp600` |
| `.governance-tiers__node` | border-radius | `primitive.radius.round` |
| `.governance-tiers__node` | transition | `semantic.*.duration.dropdown` |
| `.governance-tiers__node` | transition | `semantic.*.easing.out` |
| `.governance-tiers__node` | transition | `semantic.*.duration.dropdown` |
| `.governance-tiers__node` | transition | `semantic.*.easing.out` |
| `.governance-tiers__node[data-tier='core'],
.governance-tiers__node[data-tier='shared']` | width | `primitive.size.s64` |
| `.governance-tiers__node[data-tier='core'],
.governance-tiers__node[data-tier='shared']` | height | `primitive.size.s64` |
| `.governance-tiers__node[data-tier='team']` | width | `primitive.size.s56` |
| `.governance-tiers__node[data-tier='team']` | height | `primitive.size.s56` |
| `.governance-tiers__node[data-state='ahead']` | border | `semantic.*.border.strong` |
| `.governance-tiers__node[data-state='ahead']` | color | `semantic.*.fg.secondary` |
| `.governance-tiers__node[data-state='passed']` | background | `semantic.*.bg.widget` |
| `.governance-tiers__node[data-state='passed']` | border | `semantic.*.border.default` |
| `.governance-tiers__node[data-state='passed']` | color | `semantic.*.fg.primary` |
| `.governance-tiers__node[data-state='current']` | background | `semantic.*.bg.inverse` |
| `.governance-tiers__node[data-state='current']` | color | `semantic.*.fg.inverse` |
| `.governance-tiers__node-label` | font | `typography.body.3` |
| `.governance-tiers__node-label` | letter-spacing | `typography.body.3` |
| `.governance-tiers__gate` | padding | `primitive.space.sp50` |
| `.governance-tiers__gate` | padding | `primitive.space.sp300` |
| `.governance-tiers__gate` | border | `semantic.*.fg.accent` |
| `.governance-tiers__gate` | border | `semantic.*.fg.primary` |
| `.governance-tiers__gate` | border-radius | `primitive.radius.round` |
| `.governance-tiers__gate` | background | `semantic.*.fg.accent` |
| `.governance-tiers__gate` | background | `semantic.*.band.sunken` |
| `.governance-tiers__gate` | color | `semantic.*.fg.primary` |
| `.governance-tiers__gate` | font | `typography.emphasis.4` |
| `.governance-tiers__gate` | letter-spacing | `typography.emphasis.4` |
| `.governance-tiers__figure:has(.governance-tiers__toggle:checked) .governance-tiers__gate` | background | `semantic.*.band.sunken` |
| `.governance-tiers__bypass` | inset-block-start | `primitive.size.s64` |
| `.governance-tiers__bypass` | inset-block-end | `primitive.size.s56` |
| `.governance-tiers__bypass` | inset-block-end | `--gt-gate-drop` (local property, not a token) |
| `.governance-tiers__bypass` | width | `primitive.space.sp800` |
| `.governance-tiers__bypass` | border | `semantic.*.status.danger` |
| `.governance-tiers__bypass` | border | `semantic.*.fg.primary` |
| `.governance-tiers__bypass` | border-start-end-radius | `primitive.radius.r8` |
| `.governance-tiers__bypass` | border-end-end-radius | `primitive.radius.r8` |
| `.governance-tiers__bypass` | transition | `semantic.*.duration.dropdown` |
| `.governance-tiers__bypass` | transition | `semantic.*.easing.out` |
| `.governance-tiers__caption` | color | `semantic.*.fg.secondary` |
| `.governance-tiers__caption` | font | `typography.body.3` |
| `.governance-tiers__caption` | letter-spacing | `typography.body.3` |
