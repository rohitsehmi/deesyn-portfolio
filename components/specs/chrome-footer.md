# Chrome/Footer

Transparent by design — the band it sits in owns the surface, so the footer inherits foreground with no override. Inner container caps at Size/Max Width (1000).

Contact is a mailto arrow link, not a form. No backend to run, and a portfolio contact form converts worse than an address you can copy.

compact drops the columns slot and the rule: logo, copyright, contact. Use it on case-study pages where the footer should not compete with the next-study link.

Code-only props: href per column link, mailto address.

The columns slot is 480x120. A SLOT cannot hug, so it carries an explicit size.

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

## Token contract

Every value is a token reference, not a literal. `.` is the component root.

### scale=compact

| Node | Property | Token |
|---|---|---|
| `.` | paddingX | `Layout/l48` |
| `.` | paddingY | `Layout/l48` |
| `inner` | gap | `Layout/l48` |
| `inner/bottom` | gap | `Space/sp600` |
| `inner/bottom/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/bottom/© 2026 Rohit Sehmi` | textStyle | `Body/3` |
| `inner/bottom/© 2026 Rohit Sehmi` | fg | `fg/secondary` |
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
| `inner/top/Brand/Logo/Vector` | fg | `fg/primary` |
| `inner/rule` | bg | `border/subtle` |
| `inner/bottom` | gap | `Space/sp600` |
| `inner/bottom/© 2026 Rohit Sehmi` | textStyle | `Body/3` |
| `inner/bottom/© 2026 Rohit Sehmi` | fg | `fg/secondary` |
| `inner/bottom/Action/Arrow Link` | gap | `Space/sp200` |
| `inner/bottom/Action/Arrow Link/label` | textStyle | `Emphasis/1` |
| `inner/bottom/Action/Arrow Link/label` | fg | `fg/link` |
| `inner/bottom/Action/Arrow Link/trailing/Vector` | fg | `fg/link` |
