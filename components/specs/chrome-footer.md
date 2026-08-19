# Chrome/Footer

Transparent by design — the band it sits in owns the surface, so the footer inherits foreground with no override. Inner container caps at Size/Max Width (1000).

The copyright sits under the mark, not beside it. Side by side they read as two separate items with a gap between them; stacked, with their left edges aligned, they read as one block of attribution.

TWO links, and the bar for a third is the sentence that used to justify one: it has to point somewhere the reader cannot get to otherwise. A mailto would fail it, because Contact already has a nav item and a second affordance for an intent already served is a wasted slot. "How this was built" is contextual — code swaps it for "Back to the work" when you are already there, so it is never spent linking to the page you are reading. "2025 FigJam Board" is off-site, opens in a new tab, and is an easter egg: not announced in the nav, the README or on the build page.

They sit in a `links` wrapper with its gap bound to Layout/l40, and a grow spacer beside it does what margin-left: auto does in code. A spacer rather than SPACE_BETWEEN on the row, deliberately: with two children they look identical, but add a third and space-between silently changes meaning from "push these right" to "spread these evenly". The grow spacer keeps saying the same thing.

compact drops the columns slot and the rule: brand block, then the link. Use it on case-study pages where the footer should not compete with the next-study link. full moves the brand block up into the top row, which leaves the bottom row holding only the link — it justifies to the end rather than sitting alone on the left.

Code-only props: href per column link, href on the arrow link.

The columns slot is 480x120. A SLOT cannot hug, so it carries an explicit size.

Mark size is 32 tall (155x32 for the lockup), matching the nav so the two read as one signature down the page.

CODE-ONLY: below 768px the bottom row becomes a column-reverse — the links sit ABOVE the mark, so the thing worth tapping is in the thumb's way and the signature stays where a signature belongs. That reversal WAS safe because .footer__brand holds nothing focusable, leaving the row a single tab stop; a second link broke that precondition, since in a reversed container the visually-lower link takes focus first. The links are therefore wrapped in a container that is NOT reversed, so the group still sits above the mark while the two keep their order relative to each other. Figma models the 1440 row only.

Figma: page **Components**, set `Chrome/Footer` — 2 variants. The same contract is on the set itself: `getSharedPluginData("spec", "contract")`.

## Variant axes

| Axis | Values |
|---|---|
| `scale` | `compact` · `full` |

## Properties

| Property | Type | Default |
|---|---|---|
| `columns` | SLOT | — |

## Slots

- `columns`

## Don't

- Do not give it a surface. It is transparent so the band owns the background; setting a fill breaks the inverse case.
- Contact is a mailto, not a form. No backend, and a portfolio form converts worse than a copyable address.

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### scale=compact

| Node | Property | Token |
|---|---|---|
| `.` | paddingX | `Layout/l48` |
| `.` | paddingY | `Layout/l48` |
| `inner` | gap | `Layout/l48` |
| `inner/bottom` | gap | `Space/sp600` |
| `inner/bottom/brand/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/bottom/brand/© 2026 Rohit Sehmi` | textStyle | `Body/3` |
| `inner/bottom/brand/© 2026 Rohit Sehmi` | fg | `fg/secondary` |
| `inner/bottom/links` | gap | `Layout/l40` |
| `inner/bottom/links/Action/Arrow Link` | gap | `Space/sp200` |
| `inner/bottom/links/Action/Arrow Link/label` | textStyle | `Emphasis/1` |
| `inner/bottom/links/Action/Arrow Link/label` | fg | `fg/link` |
| `inner/bottom/links/Action/Arrow Link/trailing/Vector` | fg | `fg/link` |

### scale=full

| Node | Property | Token |
|---|---|---|
| `.` | paddingX | `Layout/l48` |
| `.` | paddingY | `Layout/l80` |
| `inner` | gap | `Layout/l48` |
| `inner/top` | gap | `Layout/l48` |
| `inner/top/brand/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/top/brand/© 2026 Rohit Sehmi` | textStyle | `Body/3` |
| `inner/top/brand/© 2026 Rohit Sehmi` | fg | `fg/secondary` |
| `inner/rule` | bg | `border/subtle` |
| `inner/bottom` | gap | `Space/sp600` |
| `inner/bottom/links` | gap | `Layout/l40` |
| `inner/bottom/links/Action/Arrow Link` | gap | `Space/sp200` |
| `inner/bottom/links/Action/Arrow Link/label` | textStyle | `Emphasis/1` |
| `inner/bottom/links/Action/Arrow Link/label` | fg | `fg/link` |
| `inner/bottom/links/Action/Arrow Link/trailing/Vector` | fg | `fg/link` |
