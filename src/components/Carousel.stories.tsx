import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from './Carousel';

/**
 * Every story here runs with autoplay off.
 *
 * Not an oversight and not laziness: a running timer inside a Chromatic
 * snapshot is a flake generator, because the build captures whichever slide the
 * interval happened to have reached. The same reasoning kept the number ticker
 * out of a hydrated component. Autoplay is exercised in the browser, on the
 * page, where it can be watched.
 */
const slides = [
  { alt: 'Control: the home as it shipped', label: 'Control' },
  { alt: 'Variant 1: sign-in prompt above the rewards module', label: 'Variant 1' },
  { alt: 'Variant 2: prompt plus a carousel hero image', label: 'Variant 2' }
];

// Default args cover Carousel's required `slides` and `label`, so the stories
// below can supply everything through `render` without restating them.
const meta = {
  title: 'Content/Carousel',
  component: Carousel,
  args: { label: 'Home screen explorations', autoplayMs: 0, slides }
} satisfies Meta<typeof Carousel>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * The controls are absent until the page script marks the root enhanced, so
 * this is what a reader sees with JavaScript blocked: a scroll-snap gallery
 * with every slide present and swipeable, and no buttons that do nothing.
 */
export const Unenhanced: S = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Carousel label="Home screen explorations" slides={slides} autoplayMs={0} />
    </div>
  )
};

/** With the controls revealed, as the page script leaves it. */
export const Enhanced: S = {
  render: () => (
    <div style={{ maxWidth: 720 }} ref={(n) => n?.querySelector('[data-carousel]')?.setAttribute('data-enhanced', 'true')}>
      <Carousel label="Home screen explorations" slides={slides} autoplayMs={0} />
    </div>
  )
};

/**
 * Two slides is the minimum that is still a gallery. One slide is a Media and
 * should be one: the script bails below two rather than rendering a control
 * that can only point at itself.
 */
export const TwoSlides: S = {
  render: () => (
    <div style={{ maxWidth: 720 }} ref={(n) => n?.querySelector('[data-carousel]')?.setAttribute('data-enhanced', 'true')}>
      <Carousel label="Two screens" slides={slides.slice(0, 2)} autoplayMs={0} />
    </div>
  )
};