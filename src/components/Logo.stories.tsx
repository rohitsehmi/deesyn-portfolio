import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta = { title: 'Marks/Logo', component: Logo } satisfies Meta<typeof Logo>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * The lockup: Rohit's disc, a multiplication sign, and Revolut's wordmark.
 *
 * `fill: currentColor` is the whole contract. Switch the toolbar to an inverse
 * band and the artwork goes light with no override, the same way it inherits
 * `var(--rui-color-foreground)` on the live site. The disc is one evenodd path
 * with the script cut out rather than drawn on top, which is what makes the
 * script read as the band showing through instead of staying dark.
 */
export const Wordmark: S = { args: { variant: 'wordmark', height: 32 } };

/** The disc alone. This replaced the RS text stand-in. */
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
