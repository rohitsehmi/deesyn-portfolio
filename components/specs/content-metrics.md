# Content/Metrics

Impact tiles. Display scale, no table, no filled progress tracks, no
comparison bars. The number carries the argument on its own.

Cell count always equals item count, so a grid never ends on a blank tile.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/Metrics.tsx` and `src/components/Metrics.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `items` | `Metric[]` | **yes** |
| `source` | `string` | **yes** |

### Property notes

- `items` Two to four. Past four this is a data dump, not an argument.
- `source` Where the numbers come from: instrument, window, sample size. Required, not optional. An unsourced number in a case study is a credibility failure rather than a design one, and this is the one prop a reviewer will check hardest. If the provenance is genuinely unavailable, say so here in words rather than leaving it blank.

## Don't

- Never ship a metric without a source. The prop is required for exactly this reason: an unsourced number is a credibility failure, not a design one.
- Do not invent precision. A figure the work does not actually claim will be the first thing a reviewer probes.
- Do not show more than four. Past four it reads as a data dump rather than an argument, and the strongest number gets buried.
- Do not present adoption numbers where outcome numbers were asked for. How many teams used it is not how much better the experience got.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.metrics` | gap | `primitive.space.sp800` |
| `.metrics__grid` | gap | `primitive.space.sp800` |
| `.metrics__item` | gap | `primitive.space.sp200` |
| `.metrics__item` | padding-block-start | `primitive.space.sp400` |
| `.metrics__item` | border-top | `semantic.*.border.default` |
| `.metrics__value` | font | `typography.display.s` |
| `.metrics__value` | letter-spacing | `typography.display.s` |
| `.metrics__value` | color | `semantic.*.fg.primary` |
| `@media (min-width: 1024px) { .metrics__value }` | font | `typography.display.l` |
| `@media (min-width: 1024px) { .metrics__value }` | letter-spacing | `typography.display.l` |
| `.metrics__label` | gap | `primitive.space.sp100` |
| `.metrics__label` | font | `typography.body.1` |
| `.metrics__label` | letter-spacing | `typography.body.1` |
| `.metrics__label` | color | `semantic.*.fg.secondary` |
| `.metrics__from` | font | `typography.body.2` |
| `.metrics__from` | letter-spacing | `typography.body.2` |
| `.metrics__from` | color | `semantic.*.fg.secondary` |
| `.metrics__source` | font | `typography.body.2` |
| `.metrics__source` | letter-spacing | `typography.body.2` |
| `.metrics__source` | color | `semantic.*.fg.secondary` |
