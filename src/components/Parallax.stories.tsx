import type { Meta, StoryObj } from '@storybook/react-vite';
import { Parallax } from './Parallax';

const meta = { title: 'Content/Parallax', component: Parallax } satisfies Meta<typeof Parallax>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * The drift only shows while the element travels through the viewport, so in
 * Storybook each story sits between two tall spacers. Scroll the canvas.
 *
 * If nothing moves, the browser has no support for scroll-driven animations,
 * or reduced motion is on. Both are intended: the image sits still and the
 * component is otherwise unchanged.
 */
const scrollable = (node: React.ReactNode) => (
  <div>
    <div style={{ height: '80vh' }} />
    {node}
    <div style={{ height: '120vh' }} />
  </div>
);

export const Default: S = {
  render: () => scrollable(
    <Parallax src="/media/hero-parallax.png" alt="Placeholder imagery, standing in for your own" />
  )
};

/** Past about 100px it stops reading as depth and starts reading as a bug. */
export const DriftRange: S = {
  render: () => scrollable(
    <div style={{ display: 'grid', gap: 'var(--primitive-layout-l48)' }}>
      <Parallax src="/media/hero-parallax.png" alt="Drift of 40 pixels" drift="40px" />
      <Parallax src="/media/hero-parallax.png" alt="Drift of 80 pixels, the default" drift="80px" />
      <Parallax src="/media/hero-parallax.png" alt="Drift of 160 pixels, too far" drift="160px" />
    </div>
  )
};

/** A taller window leaves more of the image visible at each point in the range. */
export const Portrait: S = {
  render: () => scrollable(
    <div style={{ maxWidth: 420 }}>
      <Parallax src="/media/hero-parallax.png" alt="Placeholder imagery in a portrait window" ratio="3-4" />
    </div>
  )
};
