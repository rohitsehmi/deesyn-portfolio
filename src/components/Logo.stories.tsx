import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta = { title: 'Marks/Logo', component: Logo } satisfies Meta<typeof Logo>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * The lockup: Rohit's disc, a multiplication sign, and one partner logotype.
 *
 * WHICH ONE IS A TOOLBAR SETTING, NOT A PROP. Every partner's logotype ships in
 * this one SVG and CSS keeps the one the brand calls for, because the live site
 * is prerendered once and answers on five hostnames. Switch the brand toolbar
 * to see it change; switch it to the default and there is no logotype and no
 * `x` at all, because that brand has no partner and the stylesheet narrows the
 * viewport to the disc. That last case is the apex, and it is the reason to
 * check this story in more than its default state.
 *
 * `fill: currentColor` is the whole contract. Switch the toolbar to an inverse
 * band and the artwork goes light with no override, the same way it inherits
 * `var(--rui-color-foreground)` on the live site. The disc is one evenodd path
 * with the script cut out rather than drawn on top, which is what makes the
 * script read as the band showing through instead of staying dark.
 */
export const Wordmark: S = { args: { variant: 'wordmark', height: 32 } };

/**
 * The disc alone, asked for explicitly.
 *
 * On the default brand this and `Wordmark` above render the same picture by
 * two different routes — this one through a 48x48 viewBox, that one through a
 * 233x48 viewBox clipped to its first 48. Worth knowing when comparing them:
 * they should be indistinguishable, and if they ever are not, the clip in
 * Logo.css has drifted from the artwork.
 */
export const Mark: S = { args: { variant: 'mark', height: 40 } };

/** Both, at the sizes the chrome actually uses. */
export const Sizes: S = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--primitive-space-sp1000)' }}>
      <Logo variant="wordmark" height={20} />
      <Logo variant="wordmark" height={22} />
      <Logo variant="wordmark" height={32} />
      <Logo variant="mark" height={32} />
    </div>
  )
};
