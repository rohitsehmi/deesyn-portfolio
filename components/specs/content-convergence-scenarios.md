# Content/Convergence Scenarios

Five ways to converge four design systems, on one scale, with the one the
leads recommended and the one the business took both marked.

THE UNLABELLED RUNGS ARE THE POINT, not an omission, and they are why this
component exists rather than a list. The record names the two ends of the
range and says the recommendation was "one of the middle options"; it does not
name the middle three, and inventing them would be fabricating the content of
a real artefact. Drawn as positions on a scale they say exactly what is known,
and the argument needs no more than that: a spectrum existed, the leads
recommended its middle, the business took its far end.

For the same reason the recommendation is a BRACKET rather than a mark. "One
of the middle options" is vague in the record, and a bracket is that vagueness
drawn precisely where a dot would be a claim about which one.

NO CONTROL, WHICH IS THE DELIBERATE DIFFERENCE from the two figures above it
on this page. Those hide a rejected alternative that cannot be drawn at the
same time as the shipped one, so a control is what lets a reader see both.
Here the recommendation and the choice are both on the scale at once and
nothing is hidden, so a toggle would be a device rather than content — and
three of them in one section is a tic a reader starts noticing instead of
reading.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/ConvergenceScenarios.tsx` and `src/components/ConvergenceScenarios.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `alt` | `string` | **yes** |
| `scenarios` | `ConvergenceScenario[]` | **yes** |
| `trade` | `ConvergenceTrade` | **yes** |
| `notes` | `ConvergenceNotes` | **yes** |
| `caption` | `string` | no |
| `captionCopyRef` | `string` | no |

### Property notes

- `alt` The accessible name for the whole figure, and REQUIRED for the same reason the other diagrams require one: a picture built from elements has no missing image for anyone to notice, so an undescribed one ships looking finished and nothing reports it. It has to carry what the unlabelled rungs mean. A sighted reader sees three dots between two named ends and reads a spectrum; announced, three rungs with no text are simply absent unless the description says they are there.
- `scenarios` Least ambitious first, so reading down is reading along the scale.
- `trade` The two poles of the trade-off, as axis labels rather than values.
- `notes` The two annotations, and the only prose in the picture.
- `captionCopyRef` `<file>:<path>` into src/copy, making the caption editable in the browser under `npm run dev`. Dev tooling only; inert in a build.

## Don't

- Do not name the three middle rungs. The record names the two ends of the range and says the recommendation was "one of the middle options"; inventing the rest is fabricating the content of a real artefact, which is the hazard the four reconstructions in asset-provenance.json already carry.
- Do not mark the recommendation as a single rung. "One of the middle options" is vague in the record, so a bracket says that exactly where a dot would be a claim about which one.
- Do not draw the trade-off as a value per rung. The record gives a direction and not a measurement, and five bars draw numbers nobody has. It is an axis label at each pole.
- Do not give this one a control. Both the recommendation and the choice are on the scale at once, so nothing is hidden and a toggle would be a device; three toggles in one section is a tic a reader notices instead of reading.
- Do not paint a node with a band token. An outlined dot needs a background to hide the rail behind it, and the only honest value for that is whichever band the figure landed on, which is not a token. Fill the dots instead.
- Do not drop the alt. Three of the five rungs carry no text, so a reader who cannot see the scale gets two labels and nothing between them unless the description says the positions are there.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.convergence-scenarios` | gap | `primitive.space.sp400` |
| `.convergence-scenarios__poles` | gap | `primitive.space.sp500` |
| `.convergence-scenarios__poles` | padding-inline | `--cs-count` (local property, not a token) |
| `.convergence-scenarios__poles` | padding-block-end | `primitive.space.sp500` |
| `.convergence-scenarios__pole` | gap | `primitive.space.sp200` |
| `.convergence-scenarios__pole` | font | `typography.emphasis.4` |
| `.convergence-scenarios__pole` | letter-spacing | `typography.emphasis.4` |
| `.convergence-scenarios__pole` | color | `semantic.*.fg.secondary` |
| `.convergence-scenarios__pole::before,
.convergence-scenarios__pole::after` | border-block | `primitive.space.sp100` |
| `.convergence-scenarios__pole[data-pole='start']::before` | border-inline-end | `primitive.space.sp200` |
| `.convergence-scenarios__pole[data-pole='end']::after` | border-inline-start | `primitive.space.sp200` |
| `.convergence-scenarios__note-slot` | padding-block-end | `primitive.space.sp200` |
| `.convergence-scenarios__bracket` | height | `primitive.space.sp400` |
| `.convergence-scenarios__bracket[data-where]` | border-block-start | `semantic.*.fg.accent` |
| `.convergence-scenarios__bracket[data-where]` | border-block-start | `semantic.*.fg.primary` |
| `.convergence-scenarios__bracket[data-where='start']` | border-inline-start | `semantic.*.fg.accent` |
| `.convergence-scenarios__bracket[data-where='start']` | border-inline-start | `semantic.*.fg.primary` |
| `.convergence-scenarios__bracket[data-where='start']` | border-start-start-radius | `primitive.radius.r4` |
| `.convergence-scenarios__bracket[data-where='end']` | border-inline-end | `semantic.*.fg.accent` |
| `.convergence-scenarios__bracket[data-where='end']` | border-inline-end | `semantic.*.fg.primary` |
| `.convergence-scenarios__bracket[data-where='end']` | border-start-end-radius | `primitive.radius.r4` |
| `.convergence-scenarios__rail` | height | `primitive.size.s24` |
| `.convergence-scenarios__rail::before` | background | `semantic.*.border.strong` |
| `.convergence-scenarios__node` | width | `primitive.space.sp300` |
| `.convergence-scenarios__node` | height | `primitive.space.sp300` |
| `.convergence-scenarios__node` | border-radius | `primitive.radius.round` |
| `.convergence-scenarios__node` | background | `semantic.*.border.strong` |
| `.convergence-scenarios__rung[data-named] .convergence-scenarios__node` | width | `primitive.space.sp400` |
| `.convergence-scenarios__rung[data-named] .convergence-scenarios__node` | height | `primitive.space.sp400` |
| `.convergence-scenarios__rung[data-named] .convergence-scenarios__node` | background | `semantic.*.fg.primary` |
| `.convergence-scenarios__rung[data-chosen] .convergence-scenarios__node` | width | `primitive.size.s16` |
| `.convergence-scenarios__rung[data-chosen] .convergence-scenarios__node` | height | `primitive.size.s16` |
| `.convergence-scenarios__rung[data-chosen] .convergence-scenarios__node` | background | `semantic.*.fg.accent` |
| `.convergence-scenarios__rung[data-chosen] .convergence-scenarios__node` | background | `semantic.*.fg.primary` |
| `.convergence-scenarios__body` | gap | `primitive.space.sp200` |
| `.convergence-scenarios__body` | max-width | `--cs-count` (local property, not a token) |
| `.convergence-scenarios__body` | max-width | `primitive.space.sp600` |
| `.convergence-scenarios__body` | padding-block-start | `primitive.space.sp200` |
| `.convergence-scenarios__label` | font | `typography.body.2` |
| `.convergence-scenarios__label` | letter-spacing | `typography.body.2` |
| `.convergence-scenarios__label` | color | `semantic.*.fg.primary` |
| `.convergence-scenarios__note` | padding | `primitive.space.sp50` |
| `.convergence-scenarios__note` | padding | `primitive.space.sp300` |
| `.convergence-scenarios__note` | border | `semantic.*.fg.accent` |
| `.convergence-scenarios__note` | border | `semantic.*.fg.primary` |
| `.convergence-scenarios__note` | border-radius | `primitive.radius.round` |
| `.convergence-scenarios__note` | background | `semantic.*.fg.accent` |
| `.convergence-scenarios__note` | color | `semantic.*.fg.primary` |
| `.convergence-scenarios__note` | font | `typography.emphasis.4` |
| `.convergence-scenarios__note` | letter-spacing | `typography.emphasis.4` |
| `.convergence-scenarios__note[data-kind='chosen']` | background | `semantic.*.fg.accent` |
| `.convergence-scenarios__caption` | color | `semantic.*.fg.secondary` |
| `.convergence-scenarios__caption` | font | `typography.body.3` |
| `.convergence-scenarios__caption` | letter-spacing | `typography.body.3` |
