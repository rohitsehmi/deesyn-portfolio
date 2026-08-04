import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prose } from './Prose';

const meta = { title: 'Content/Prose', component: Prose } satisfies Meta<typeof Prose>;
export default meta;
type S = StoryObj<typeof meta>;

/** The lead paragraph sits at full foreground contrast; the rest steps back. */
export const WithLead: S = {
  render: () => (
    <Prose lead>
      <p>
        Proof of address was the single largest drop-off in the application, and
        it had been read as a form length problem since 2023.
      </p>
      <p>
        Watching eleven sessions changed the diagnosis. People were not tiring
        of the form. They were leaving to find a document, and nothing in the
        flow suggested they could come back to the same place.
      </p>
      <p>
        That reframed the work from shortening a form to designing a resumable
        one, which is a different problem with a different set of constraints.
      </p>
    </Prose>
  )
};

/** Narrow measure for dense argument. */
export const Narrow: S = {
  render: () => (
    <Prose measure="narrow">
      <p>
        The risk team required six documents. Four of them could be derived from
        data we already held, which nobody had checked because the requirement
        predated the data.
      </p>
    </Prose>
  )
};
