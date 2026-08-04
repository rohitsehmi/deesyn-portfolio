import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hindsight } from './Hindsight';

const meta = { title: 'Content/Hindsight', component: Hindsight } satisfies Meta<typeof Hindsight>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * A useful hindsight names a cost that was actually paid. Compare this with
 * "I would have done more user testing", which is the answer every candidate
 * gives and which tells a reviewer nothing.
 */
export const Default: S = {
  render: () => (
    <Hindsight>
      <p>
        We instrumented completion but not abandonment reason, so when the rate
        moved we could argue about why for six weeks without resolving it. The
        event schema was a two day job at the start and a re-run of the whole
        study by the time we needed it.
      </p>
    </Hindsight>
  )
};

/** The title takes an override when the project needs a sharper framing. */
export const CustomTitle: S = {
  render: () => (
    <Hindsight title="What I got wrong">
      <p>
        I treated the document upload step as a technical constraint and
        designed around it for two months. It was a vendor default that a
        single conversation would have changed.
      </p>
    </Hindsight>
  )
};
