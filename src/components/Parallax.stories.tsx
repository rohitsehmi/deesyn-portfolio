import type { Meta, StoryObj } from '@storybook/react-vite';
import { Parallax } from './Parallax';

const meta = { title: 'Content/Parallax', component: Parallax } satisfies Meta<typeof Parallax>;
export default meta;
type S = StoryObj<typeof meta>;

const SRC = '/media/hero-parallax.png';

/**
 * The drift only shows while the section travels through the viewport, so each
 * story sits between two tall spacers. Scroll the canvas.
 *
 * If nothing moves, the browser has no support for scroll-driven animations or
 * reduced motion is on. Both are intended: the image sits still and nothing
 * else changes.
 */
const scrollable = (node: React.ReactNode) => (
  <div>
    <div style={{ height: '70vh' }} />
    {node}
    <div style={{ height: '110vh' }} />
  </div>
);

/**
 * The homepage hero. `band="inverse"` is doing real work: it resolves bg/scrim
 * to 70% black, which is what makes white text over this photograph pass AA.
 * Measured on this image, the brightest 1% of the text area reaches 7.99:1.
 */
export const Hero: S = {
  args: { src: SRC, alt: 'Placeholder imagery' },
  render: () => scrollable(
    <Parallax src={SRC} alt="Placeholder imagery" band="inverse" priority>
      <h1 style={{ margin: 0, font: 'var(--type-display-m)', letterSpacing: 'var(--type-display-m-tracking)', maxWidth: '16ch' }}>
        Product design, end to end.
      </h1>
    </Parallax>
  )
};

/**
 * Without the scrim, for comparison only. Do not ship this over photography:
 * unscrimmed, the brightest 1% of this image gives white 3.27:1, which fails
 * AA for body text, and 1.62:1 at the worst pixel.
 */
export const NoScrim: S = {
  args: { src: SRC, alt: 'Placeholder imagery', scrim: false },
  render: () => scrollable(
    <Parallax src={SRC} alt="Placeholder imagery" band="inverse" scrim={false}>
      <h1 style={{ margin: 0, font: 'var(--type-display-m)', letterSpacing: 'var(--type-display-m-tracking)', maxWidth: '16ch' }}>
        This fails contrast
      </h1>
    </Parallax>
  )
};

/** Past about 100px it stops reading as depth and starts reading as a bug. */
export const DriftRange: S = {
  args: { src: SRC, alt: 'Placeholder imagery' },
  render: () => scrollable(
    <div>
      {['40px', '80px', '160px'].map((d) => (
        <Parallax key={d} src={SRC} alt={`Drift of ${d}`} band="inverse" minHeight="46vh" drift={d}>
          <p style={{ margin: 0, font: 'var(--type-heading-m)', letterSpacing: 'var(--type-heading-m-tracking)' }}>
            drift {d}
          </p>
        </Parallax>
      ))}
    </div>
  )
};

/** No content over it, for a plain full-bleed image band. */
export const ImageOnly: S = {
  args: { src: SRC, alt: 'Placeholder imagery', scrim: false },
  render: () => scrollable(
    <Parallax src={SRC} alt="Placeholder imagery" minHeight="50vh" scrim={false} />
  )
};
