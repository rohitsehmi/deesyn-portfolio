# Content/Hindsight

What you would change if you ran the project again.

Named on a reader as something the team actively looks for, and cheap to
write, which makes leaving it out the expensive choice. It reads as
self-awareness only when it names a real cost. "More user testing" is the
answer everyone gives and scores nothing.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Hindsight.tsx` and `src/components/Hindsight.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `title` | `string` | no |
| `level` | `2 | 3` | no |
| `children` | `ReactNode` | no |

### Property notes

- `title` Override only if the project needs a more specific framing.
- `level` The callout carries its own heading, so it is its section's header by default. Pair it with a SectionHeading saying the same thing and the page states the point twice.

## Don't

- Do not write that you would have done more user testing. It is the answer every candidate gives and it names no cost that was actually paid.
- Do not pair it with a section heading that says the same thing. The callout carries its own heading, so the page would state the point twice.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.hindsight` | gap | `primitive.space.sp400` |
| `.hindsight` | padding | `primitive.space.sp1000` |
| `.hindsight` | border-radius | `primitive.radius.r20` |
| `.hindsight` | background | `semantic.*.bg.subtle` |
| `.hindsight` | border-inline-start | `semantic.*.fg.accent` |
| `.hindsight__title` | font | `typography.heading.s` |
| `.hindsight__title` | letter-spacing | `typography.heading.s` |
| `.hindsight__title` | color | `semantic.*.fg.primary` |
| `.hindsight__body > * + *` | margin-block-start | `primitive.space.sp400` |
| `.hindsight__body p` | font | `typography.body.1` |
| `.hindsight__body p` | letter-spacing | `typography.body.1` |
| `.hindsight__body p` | color | `semantic.*.fg.secondary` |
