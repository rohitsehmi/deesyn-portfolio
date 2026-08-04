# Content/Prose

The running text of a case study. Owns measure and vertical rhythm so no
page has to restate them, and so line length stays inside 65-75ch where
reading speed holds up.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Prose.tsx` and `src/components/Prose.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `measure` | `'default' | 'narrow'` | no |
| `lead` | `boolean` | no |
| `children` | `ReactNode` | no |

### Property notes

- `measure` `narrow` caps at 62ch for dense argument, `default` at 68ch.
- `lead` Raises size and weight for a single opening paragraph.

## Don't

- Do not set type on anything inside prose. It owns measure and rhythm, and a paragraph that overrides them stops matching the rest of the study.
- Do not widen past the measure by nesting a wider element. Past 75ch reading speed drops and the page reads as a wall.
- Do not use Prose for a single line of text. It is for running argument, not for a caption or a label.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.prose` | color | `semantic.*.fg.primary` |
| `.prose` | font-family | `typography.body.l` |
| `.prose > * + *` | margin-block-start | `primitive.space.sp600` |
| `.prose p` | font | `typography.body.l` |
| `.prose p` | letter-spacing | `typography.body.l` |
| `.prose p` | color | `semantic.*.fg.secondary` |
| `.prose[data-lead='true'] > p:first-child` | font | `typography.body.xl` |
| `.prose[data-lead='true'] > p:first-child` | letter-spacing | `typography.body.xl` |
| `.prose[data-lead='true'] > p:first-child` | color | `semantic.*.fg.primary` |
| `.prose strong` | font-weight | `typography.emphasis.1` |
| `.prose strong` | color | `semantic.*.fg.primary` |
| `.prose a` | color | `semantic.*.fg.link` |
| `.prose a:hover` | color | `semantic.*.fg.link-hover` |
| `.prose ul, .prose ol` | padding-inline-start | `primitive.space.sp600` |
| `.prose li` | font | `typography.body.l` |
| `.prose li` | letter-spacing | `typography.body.l` |
| `.prose li` | color | `semantic.*.fg.secondary` |
| `.prose li + li` | margin-block-start | `primitive.space.sp300` |
| `.prose hr` | border-top | `semantic.*.border.subtle` |
| `.prose hr` | margin-block | `primitive.layout.l40` |
