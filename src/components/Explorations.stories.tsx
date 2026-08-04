import type { Meta, StoryObj } from '@storybook/react-vite';
import { Explorations } from './Explorations';

const meta = { title: 'Content/Explorations', component: Explorations } satisfies Meta<typeof Explorations>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * The image slots take real artefacts. The placeholders here stand in for
 * wireframes and prototype stills, never for a UI faked out of rectangles.
 */
export const RejectedPaths: S = {
  args: {
    items: [
      {
        title: 'One long form, progressively disclosed',
        why: 'Tested worst of the three. Six of eight participants scrolled past the disclosure and assumed the remaining fields were optional, so completion looked healthy while the data underneath was thin.',
        image: { alt: 'Wireframe of the single long form with collapsed sections' }
      },
      {
        title: 'Splitting identity checks into a separate session',
        why: 'Removed the drop-off from the main flow by moving it somewhere we could not measure. Return rate was 34 percent, so the problem had been relocated rather than solved.',
        image: { alt: 'Flow diagram showing identity capture moved to a second session' }
      }
    ]
  }
};

/** A single exploration still renders as a grid cell, not a full-width block. */
export const SingleItem: S = {
  args: {
    items: [
      {
        title: 'Card sort before the flow was drawn',
        why: 'Participants grouped by document type where the existing flow grouped by legal entity. That mismatch set the structure for everything after it.',
        image: { alt: 'Photograph of the card sort output' }
      }
    ]
  }
};
