# Chrome/Theme Toggle

Flips the site between light and dark, and remembers the choice.

Which icon shows is decided in CSS, not JavaScript, using the same cascade
tokens.css uses to resolve the theme: `[data-theme]` when a choice has been
made, `prefers-color-scheme` when it has not. That means the correct icon is
painted before any script runs and there is no hydration mismatch to work
around. The button shows where you are going, not where you are.

The accessible name is state independent on purpose. "Switch colour theme"
is true in both directions, so it needs no JavaScript to stay accurate, and
a screen reader user is told what the control does rather than what the
page currently looks like.

The no-flash script lives in Base.astro and has to run before first paint,
so it cannot live here.

revolut.com has no theme toggle, so this is a deliberate departure. It earns
its place on this site because the whole system is dual-theme by
construction and this is the only way a reader can see that.

**Code only.** No Figma set. Its contract depends on required props and CSS state, neither of which a Figma variant can express.

Implementation: `src/components/ThemeToggle.tsx` and `src/components/ThemeToggle.css`.

## Properties

| Property | Type | Required |
|---|---|---|
| `size` | `'sm' | 'md' | 'lg'` | no |

### Property notes

- `size` sm 32, md 44, lg 48. Marketing minimum is 48.

## Don't

- Do not decide the icon in JavaScript. Resolving it in CSS, with the same cascade tokens.css uses, means the right icon is painted on the first frame instead of after hydration.
- Do not drop the blocking inline script in the document head. Without it the page paints in the system theme and then visibly flips to the remembered one, which is worse than having no toggle.
- Do not make the accessible name describe the current theme. It describes the action, so it stays true in both directions and needs no script to keep it accurate.
- Do not add a third state to the button. Light and dark is what a single control can carry; if following the system needs to be reachable again, that is a separate control, not a longer cycle.

## Token contract

Every value is a token reference, not a literal. Verified by `design/verify-css.mjs`.

| Selector | Property | Token |
|---|---|---|
| `.theme-toggle` | right | `primitive.space.sp600` |
| `.theme-toggle` | bottom | `primitive.space.sp600` |
| `.theme-toggle` | z-index | `--z-fab` (local property, not a token) |
| `.theme-toggle` | border | `semantic.*.border.subtle` |
| `@media (min-width: 768px) { .theme-toggle }` | right | `primitive.layout.l40` |
| `@media (min-width: 768px) { .theme-toggle }` | bottom | `primitive.layout.l40` |
