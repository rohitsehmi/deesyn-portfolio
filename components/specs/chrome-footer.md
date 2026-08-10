# Chrome/Footer

Transparent by design — the band it sits in owns the surface, so the footer inherits foreground with no override. Inner container caps at Size/Max Width (1000).

The copyright sits under the mark, not beside it. Side by side they read as two separate items with a gap between them; stacked, with their left edges aligned, they read as one block of attribution.

The single link is not a contact address. Contact already has a nav item, so a mailto here would be a second affordance for an intent that is already served, and the footer's one link is worth more pointing somewhere the reader cannot get to otherwise.

compact drops the columns slot and the rule: brand block, then the link. Use it on case-study pages where the footer should not compete with the next-study link. full moves the brand block up into the top row, which leaves the bottom row holding only the link — it justifies to the end rather than sitting alone on the left.

Code-only props: href per column link, href on the arrow link.

The columns slot is 480x120. A SLOT cannot hug, so it carries an explicit size.

Mark size is 32 tall (155x32 for the lockup), matching the nav so the two read as one signature down the page.

CODE-ONLY: below 768px the bottom row becomes a column-reverse — the "How this was built" link sits ABOVE the mark, so the one thing worth tapping is in the thumb's way and the signature stays where a signature belongs. Safe as a visual reversal because .footer__brand holds no focusable element: the mark is an inline SVG and the copyright is a paragraph, so the row has exactly one tab stop and reversing it cannot desynchronise focus order from the screen. Figma models the 1440 row only.

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
| `inner/bottom/Action/Arrow Link` | gap | `Space/sp200` |
| `inner/bottom/Action/Arrow Link/label` | textStyle | `Emphasis/1` |
| `inner/bottom/Action/Arrow Link/label` | fg | `fg/link` |
| `inner/bottom/Action/Arrow Link/trailing/Vector` | fg | `fg/link` |

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
| `inner/bottom/Action/Arrow Link` | gap | `Space/sp200` |
| `inner/bottom/Action/Arrow Link/label` | textStyle | `Emphasis/1` |
| `inner/bottom/Action/Arrow Link/label` | fg | `fg/link` |
| `inner/bottom/Action/Arrow Link/trailing/Vector` | fg | `fg/link` |
