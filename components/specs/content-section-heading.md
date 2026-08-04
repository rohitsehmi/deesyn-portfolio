# Content/Section Heading

A case-study section header.

There is deliberately no `eyebrow` prop. An eyebrow above every section is
the clearest tell that a page was generated rather than written, and a
section's position already categorises it. If one is genuinely needed, it is
a one-off in the page, not an affordance the component hands out.

`standfirst` stacks below the heading. The split-header pattern (big heading
left, small paragraph right) is banned as a default.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/SectionHeading.tsx` and `src/components/SectionHeading.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `level` | `2 | 3` | no |
| `children` | `ReactNode` | **yes** |
| `standfirst` | `ReactNode` | no |
| `id` | `string` | no |

### Property notes

- `standfirst` Optional supporting line. Stacked under the heading, never beside it.

## Don't

- Do not add an eyebrow above the heading. The component offers no such prop on purpose: an eyebrow over every section is the clearest tell that a page was generated, and the section position already categorises it.
- Do not put the standfirst beside the heading. Stacked is the only layout. A big heading left with a small explainer right is banned as a default.
- Do not skip a heading level to get a size. Level is document structure; size comes from the scale and the breakpoint.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.section-heading` | gap | `primitive.space.sp400` |
| `.section-heading` | margin-block-end | `primitive.layout.l40` |
| `.section-heading__title` | color | `semantic.*.fg.primary` |
| `.section-heading[data-level='2'] .section-heading__title` | font | `typography.heading.l` |
| `.section-heading[data-level='2'] .section-heading__title` | letter-spacing | `typography.heading.l` |
| `.section-heading[data-level='3'] .section-heading__title` | font | `typography.heading.s` |
| `.section-heading[data-level='3'] .section-heading__title` | letter-spacing | `typography.heading.s` |
| `@media (min-width: 768px) { .section-heading[data-level='2'] .section-heading__title }` | font | `typography.display.s` |
| `@media (min-width: 768px) { .section-heading[data-level='2'] .section-heading__title }` | letter-spacing | `typography.display.s` |
| `@media (min-width: 768px) { .section-heading[data-level='3'] .section-heading__title }` | font | `typography.heading.m` |
| `@media (min-width: 768px) { .section-heading[data-level='3'] .section-heading__title }` | letter-spacing | `typography.heading.m` |
| `.section-heading__standfirst` | font | `typography.body.l` |
| `.section-heading__standfirst` | letter-spacing | `typography.body.l` |
| `.section-heading__standfirst` | color | `semantic.*.fg.secondary` |
| `@media (min-width: 768px) { .section-heading__standfirst }` | font | `typography.body.xl` |
| `@media (min-width: 768px) { .section-heading__standfirst }` | letter-spacing | `typography.body.xl` |
