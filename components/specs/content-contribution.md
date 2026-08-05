# Content/Contribution

Who did what. Grouped pairs with one rule per row group rather than a
hairline under every line, which is the spec-table tell.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Contribution.tsx` and `src/components/Contribution.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `items` | `ContributionItem[]` | **yes** |
| `copyBase` | `string` | no |

### Property notes

- `items` Role, scope, team, duration. Keep "what I owned" and "what the team owned" as separate entries: a reader asks what your specific role was, and a combined answer reads as a claim on other people's work.
- `copyBase` `<file>:<path>` into src/copy for this list. The index and field are appended, so a base of `study:items` yields `study:items.0.title`. Dev tooling only; inert in a build.

## Don't

- Do not merge what you owned with what the team owned. A combined answer reads as a claim on other people work, which is the opposite of the intended signal.
- Do not give a role without scope. Lead Designer on its own says nothing about what you actually decided.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.contribution` | gap | `primitive.space.sp600` |
| `.contribution__row` | gap | `primitive.space.sp100` |
| `@media (min-width: 640px) { .contribution__row }` | gap | `primitive.space.sp600` |
| `.contribution__term` | font | `typography.emphasis.1` |
| `.contribution__term` | letter-spacing | `typography.emphasis.1` |
| `.contribution__term` | color | `semantic.*.fg.primary` |
| `.contribution__detail` | font | `typography.body.1` |
| `.contribution__detail` | letter-spacing | `typography.body.1` |
| `.contribution__detail` | color | `semantic.*.fg.secondary` |
