# Content/Case Study Tile

The whole tile is the link, so there is no separate "read more" affordance
competing with it for the same intent.

The discipline label is the one piece of metadata that earns its place: with
only two studies, which discipline each argues for is the thing a reader is
scanning for. It is not an eyebrow and there is no second one.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/CaseStudyTile.tsx` and `src/components/CaseStudyTile.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `title` | `string` | **yes** |
| `summary` | `string` | **yes** |
| `discipline` | `string` | **yes** |
| `href` | `string` | **yes** |
| `image` | `{ src?: string; alt: string; ratio?: MediaRatio }` | no |

### Property notes

- `summary` One line that says what the problem was. It has to earn the click.
- `discipline` The discipline this study argues for. Two studies, two disciplines.
- `image` Plain data rather than a ReactNode slot: JSX written inside an `.astro` expression produces an Astro template object, not a React element.

## Don't

- Do not add a read more link. The whole tile is already the link, and a second affordance for the same intent splits the click.
- Do not put the discipline label on as an eyebrow in uppercase tracked type. It is metadata a reader is scanning for, not a decorative category heading.
- Do not write a summary that restates the title. The line has one job: say what the problem was, well enough to earn the click.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.tile` | gap | `primitive.space.sp600` |
| `.tile__media` | border-radius | `primitive.radius.r20` |
| `.tile__media .media__frame` | transition | `semantic.*.duration.dropdown` |
| `.tile__media .media__frame` | transition | `semantic.*.easing.out` |
| `.tile:focus-visible` | outline | `semantic.*.border.focus` |
| `.tile:focus-visible` | border-radius | `primitive.radius.r20` |
| `.tile__body` | gap | `primitive.space.sp200` |
| `.tile__discipline` | font | `typography.emphasis.2` |
| `.tile__discipline` | letter-spacing | `typography.emphasis.2` |
| `.tile__discipline` | color | `semantic.*.fg.accent` |
| `.tile__title` | font | `typography.heading.m` |
| `.tile__title` | letter-spacing | `typography.heading.m` |
| `.tile__title` | color | `semantic.*.fg.primary` |
| `@media (min-width: 768px) { .tile__title }` | font | `typography.heading.l` |
| `@media (min-width: 768px) { .tile__title }` | letter-spacing | `typography.heading.l` |
| `.tile__summary` | font | `typography.body.l` |
| `.tile__summary` | letter-spacing | `typography.body.l` |
| `.tile__summary` | color | `semantic.*.fg.secondary` |
