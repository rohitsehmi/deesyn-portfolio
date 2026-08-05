import type { Meta, StoryObj } from '@storybook/react-vite';
import { Media } from './Media';

// Default args cover Media's required `alt`, so the stories below can supply
// everything through `render` without each one having to restate it.
const meta = {
  title: 'Content/Media',
  component: Media,
  args: { alt: 'Placeholder imagery' }
} satisfies Meta<typeof Media>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * Media was only ever exercised inside Card, so six of its eight variants had
 * never been snapshotted. Each ratio is here on its own.
 */
export const Ratios: S = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--primitive-space-sp800)', maxWidth: 720 }}>
      <Media alt="Sixteen by nine" ratio="16-9" caption="16-9" />
      <Media alt="Four by three" ratio="4-3" caption="4-3" />
      <Media alt="Square" ratio="1-1" caption="1-1" />
      <Media alt="Three by four, portrait" ratio="3-4" caption="3-4" />
    </div>
  )
};

/** inset keeps r20. bleed runs to the band edge and drops the radius. */
export const Fit: S = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--primitive-space-sp800)', maxWidth: 520 }}>
      <Media alt="Inset, keeping the corner radius" ratio="16-9" fit="inset" caption="inset" />
      <Media alt="Bleeding to the container edge" ratio="16-9" fit="bleed" caption="bleed" />
    </div>
  )
};

/**
 * The caption sits below the frame, outside it. No labels overlaid on the
 * image, and no decorative photo credits.
 */
export const WithCaption: S = {
  args: {
    alt: 'The consolidated review queue after the rebuild',
    ratio: '16-9',
    caption: 'The queue after consolidation. Real screenshots only, never a product UI faked out of rectangles.'
  }
};

/** No src yet. The placeholder still announces its alt text to assistive tech. */
export const AwaitingAsset: S = {
  args: { alt: 'Placeholder for a wireframe that has not been exported yet', ratio: '4-3' }
};
