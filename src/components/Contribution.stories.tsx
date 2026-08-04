import type { Meta, StoryObj } from '@storybook/react-vite';
import { Contribution } from './Contribution';

const meta = { title: 'Content/Contribution', component: Contribution } satisfies Meta<typeof Contribution>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * "What I owned" and "What the team owned" stay separate entries. A reader
 * asks what your specific role was, and a merged answer reads as a claim on
 * other people's work.
 */
export const Default: S = {
  args: {
    items: [
      { term: 'Role', detail: 'designer, reporting to the Head of Design' },
      { term: 'What I owned', detail: 'Problem framing, the flow architecture, all high fidelity screens, and the usability study design' },
      { term: 'What the team owned', detail: 'Two product designers on adjacent surfaces, a content designer, and a researcher who ran the sessions I designed' },
      { term: 'Duration', detail: 'Nine months, from discovery to launch in the first market' }
    ]
  }
};
