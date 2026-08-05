import type { Meta, StoryObj } from '@storybook/react-vite';
import { Parallax } from './Parallax';

const meta = { title: 'Content/Parallax', component: Parallax } satisfies Meta<typeof Parallax>;
export default meta;
type S = StoryObj<typeof meta>;

// Imported, not a public/ path. The hero moved into src/assets/ so Astro's
// image pipeline can emit WebP widths for it; Storybook's Vite resolves the
// same import to a URL, so both get the file from one place.
//
// `?url` is load-bearing. A bare import of a .png is typed ImageMetadata by
// Astro, because in a page that is what it is — but Storybook runs plain Vite,
// where it resolves to a URL string. The suffix makes both agree on a string.
import SRC from '../assets/hero-parallax.png?url';

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

const H1 = { margin: 0, font: 'var(--type-display-m)', letterSpacing: 'var(--type-display-m-tracking)', maxWidth: '16ch' } as const;

/**
 * The homepage hero. The section carries `data-on-media`, which it sets itself
 * — not a band role, because bands are relative and flip with the theme while a
 * photograph does not.
 *
 * `tone="light"` because this image is pale, which turns the scrim off. Both
 * halves matter: absolute is not the same as dark, and treating a pale image as
 * dark forces a scrim heavy enough to destroy it. Measured glyph by glyph on
 * this image — dark text unscrimmed is 14.75:1 median, white text needs the
 * full 70% black to reach 5.38:1, and at 70% the picture is a grey wash.
 */
export const Hero: S = {
  args: { src: SRC, alt: 'Placeholder imagery' },
  render: () => scrollable(
    <Parallax src={SRC} alt="Placeholder imagery" tone="light" objectPosition="left center" priority>
      <h1 style={H1}>Product design, end to end.</h1>
    </Parallax>
  )
};

/**
 * The same image treated as a dark one. This is the failure the `tone` prop
 * exists to prevent: the foreground goes white, the scrim comes on at 70%
 * black, and an airy composition becomes a muddy rectangle. It passes AA — that
 * is the trap. Contrast is not the only thing the scrim decides.
 */
export const WrongTone: S = {
  args: { src: SRC, alt: 'Placeholder imagery' },
  render: () => scrollable(
    <Parallax src={SRC} alt="Placeholder imagery" tone="dark" priority>
      <h1 style={H1}>Legible, and wrong</h1>
    </Parallax>
  )
};

/**
 * Why `objectPosition` is not cosmetic. Full-bleed plus `cover` crops hard on
 * the horizontal as the viewport narrows, so on a phone this image keeps about
 * a third of its width. Centred, that third is the busiest part of the picture:
 * measured at 390px, the same hero that passes comfortably on a desktop failed
 * AA on 33% of its glyph pixels. Anchoring left fixed it and changed nothing
 * above 1440, where the image is not cropped horizontally at all.
 *
 * Narrow the Storybook viewport to see it.
 */
export const CropPosition: S = {
  args: { src: SRC, alt: 'Placeholder imagery' },
  render: () => scrollable(
    <div>
      {(['left center', 'center', 'right center'] as const).map((p) => (
        <Parallax key={p} src={SRC} alt={`Cropped ${p}`} tone="light" objectPosition={p} minHeight="46vh">
          <p style={{ margin: 0, font: 'var(--type-heading-m)', letterSpacing: 'var(--type-heading-m-tracking)' }}>
            object-position: {p}
          </p>
        </Parallax>
      ))}
    </div>
  )
};

/**
 * A dark image without its scrim, for comparison only. Never ship it: over a
 * dark photograph the scrim is the only thing between white type and whatever
 * the picture happens to be doing, and it is doing that job at full strength.
 */
export const NoScrim: S = {
  args: { src: SRC, alt: 'Placeholder imagery', scrim: false },
  render: () => scrollable(
    <Parallax src={SRC} alt="Placeholder imagery" tone="dark" scrim={false}>
      <h1 style={H1}>This fails contrast</h1>
    </Parallax>
  )
};

/** Past about 100px it stops reading as depth and starts reading as a bug. */
export const DriftRange: S = {
  args: { src: SRC, alt: 'Placeholder imagery' },
  render: () => scrollable(
    <div>
      {['40px', '80px', '160px'].map((d) => (
        <Parallax key={d} src={SRC} alt={`Drift of ${d}`} tone="light" minHeight="46vh" drift={d}>
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
