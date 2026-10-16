# Content/Case Study Tile

The link is on the title, and a stretched pseudo element makes the whole tile
clickable.

The obvious approach, wrapping everything in one anchor, gives the link an
accessible name of the discipline plus the title plus the whole summary,
which is what a screen reader then reads out in a list of links. It also
makes it impossible to put any other link inside. This way the accessible
name is the title alone and the click target is still the whole tile.

The cue is aria-hidden for the same reason: it is a visual signal that the
tile is clickable, and repeating it to a screen reader adds nothing to a link
that already says what it is.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/CaseStudyTile.tsx` and `src/components/CaseStudyTile.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `title` | `string` | **yes** |
| `summary` | `string` | **yes** |
| `discipline` | `string` | **yes** |
| `href` | `string` | **yes** |
| `variant` | `'bare' | 'card'` | no |
| `image` | `{ src?: string; srcSet?: string; srcDark?: string; srcSetDark?: string; sizes?: string; alt: string; ratio?: MediaRatio; }` | no |
| `copyBase` | `string` | no |
| `mark` | `string` | no |
| `markCopyRef` | `string` | no |
| `cue` | `boolean` | no |

### Property notes

- `summary` One line that says what the problem was. It has to earn the click.
- `discipline` The discipline this study argues for. Two studies, two disciplines.
- `variant` `bare` groups by image and spacing, the way revolut.com does. `card` puts it on a surface with a border. Cards are the lazy grouping: the band already separates this section, and with no shadows available in site chrome a card cannot do the one thing cards are for. Kept as an option because the affordance question is real.
- `image` Plain data rather than a ReactNode slot: JSX written inside an `.astro` expression produces an Astro template object, not a React element. Dark plate, when the picture itself changes with the theme.
- `copyBase` `<file>:<path>` into src/copy for this tile's strings; `.title`, `.summary` and `.discipline` are appended. Dev tooling only — inert in a build. The same tile renders on the index and as the next-study link at the foot of the other study, both pointing at one entry in src/copy/studies.json, so editing it in either place changes both.
- `mark` A second chip on the cover, for the homepage studies. The discipline chip stays. Absent on the next-study tile, which has no cover to put it on.
- `cue` The circled arrow at the foot of the tile. The homepage sends the same signal with a pointer disc instead, so it can leave this off.

## Don't

- Do not add a read more link. The whole tile is already the link, and a second affordance for the same intent splits the click.
- Do not put the discipline label on as an eyebrow in uppercase tracked type. It is metadata a reader is scanning for, not a decorative category heading.
- Do not write a summary that restates the title. The line has one job: say what the problem was, well enough to earn the click.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.tile` | gap | `primitive.space.sp600` |
| `.tile` | transition | `semantic.*.duration.press` |
| `.tile` | transition | `semantic.*.easing.out` |
| `.tile__media` | border-radius | `primitive.radius.r20` |
| `.tile__media > .tile__discipline` | left | `primitive.space.sp500` |
| `.tile__media > .tile__discipline` | bottom | `primitive.space.sp600` |
| `.tile__media > .tile__discipline` | max-width | `primitive.space.sp500` |
| `.tile__media > .tile__discipline .tag` | background | `semantic.*.bg.surface` |
| `.tile__media > .tile__discipline .tag` | color | `semantic.*.fg.primary` |
| `.tile__media > .tile__discipline .tag` | border | `semantic.*.border.strong` |
| `.tile__media > .tile__mark` | top | `primitive.space.sp500` |
| `.tile__media > .tile__mark` | left | `primitive.space.sp500` |
| `.tile__media > .tile__mark` | max-width | `primitive.space.sp500` |
| `.tile__media > .tile__mark .tag` | background | `semantic.*.highlight` |
| `.tile__media > .tile__mark .tag` | color | `semantic.*.fg.on-highlight` |
| `.tile__media .media__frame` | transition | `semantic.*.duration.dropdown` |
| `.tile__media .media__frame` | transition | `semantic.*.easing.out` |
| `.tile__body` | gap | `primitive.space.sp200` |
| `.tile__discipline` | margin | `primitive.space.sp200` |
| `.tile__title` | font-family | `typography.heading.m` |
| `.tile__title` | font-weight | `typography.heading.m` |
| `.tile__title` | font-size | `typography.heading.m` |
| `.tile__title` | letter-spacing | `typography.heading.m` |
| `.tile__title` | line-height | `typography.heading.m` |
| `.tile__title` | color | `semantic.*.fg.primary` |
| `.tile__title` | background-image | `semantic.*.highlight` |
| `.tile__title` | background-image | `semantic.*.highlight` |
| `.tile__title` | transition | `semantic.*.duration.dropdown` |
| `.tile__title` | transition | `semantic.*.easing.out` |
| `@media (min-width: 768px) { .tile__title }` | font-size | `typography.heading.l` |
| `@media (min-width: 768px) { .tile__title }` | letter-spacing | `typography.heading.l` |
| `.tile:has(.tile__link:focus-visible)` | outline | `semantic.*.border.focus` |
| `.tile:has(.tile__link:focus-visible)` | border-radius | `primitive.radius.r20` |
| `.tile__summary` | font | `typography.body.l` |
| `.tile__summary` | letter-spacing | `typography.body.l` |
| `.tile__summary` | color | `semantic.*.fg.secondary` |
| `.tile__cue-slot` | padding-block-start | `primitive.space.sp600` |
| `@media (hover: hover) and (pointer: fine) { .tile:hover .tile__cue[data-variant='secondary'] }` | background | `semantic.*.action.secondary-bg-hover` |
| `.tile[data-variant='card']` | background | `semantic.*.bg.surface` |
| `.tile[data-variant='card']` | border | `semantic.*.border.subtle` |
| `.tile[data-variant='card']` | border-radius | `primitive.radius.r20` |
| `.tile[data-variant='card']` | transition | `semantic.*.duration.dropdown` |
| `.tile[data-variant='card']` | transition | `semantic.*.easing.out` |
| `@media (hover: hover) and (pointer: fine) { .tile[data-variant='card']:hover }` | background | `semantic.*.bg.surface-raised` |
| `.tile[data-variant='card'] .tile__body` | padding | `primitive.space.sp1000` |
