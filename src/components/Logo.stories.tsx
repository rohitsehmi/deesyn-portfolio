import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta = { title: 'Marks/Logo', component: Logo } satisfies Meta<typeof Logo>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * `fill: currentColor` is the whole contract. Switch the toolbar to an inverse
 * band and the mark goes light with no override, the same way it inherits
 * `var(--rui-color-foreground)` on the live site.
 *
 * The mark had no story until now, so Chromatic had never snapshotted it.
 */
export const Wordmark: S = { args: { variant: 'wordmark', height: 24 } };

/**
 * Stand-in. Rohit's own mark is in the CV-Build Figma file, which needs the
 * Desktop Bridge plugin open in it before the asset can be pulled across.
 *
 * Its font-size is the one place in the codebase that stays off the type scale
 * on purpose: it tracks the `height` prop, so a fixed step would break it.
 */
export const Mark: S = { args: { variant: 'mark', height: 24 } };

/** Both marks, at the sizes the chrome actually uses. */
export const Sizes: S = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--primitive-space-sp1000)' }}>
      <Logo variant="wordmark" height={18} />
      <Logo variant="wordmark" height={22} />
      <Logo variant="wordmark" height={32} />
      <Logo variant="mark" height={32} />
    </div>
  )
};
