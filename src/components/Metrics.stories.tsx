import type { Meta, StoryObj } from '@storybook/react-vite';
import { Metrics } from './Metrics';

const meta = { title: 'Content/Metrics', component: Metrics } satisfies Meta<typeof Metrics>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * All figures below are placeholder, and the source line says so. That is the
 * point of `source` being a required prop rather than an optional one.
 */
export const ThreeUp: S = {
  args: {
    items: [
      { value: '68%', label: 'of applicants finished the flow in one sitting', from: '41%' },
      { value: '2.4 days', label: 'median time to a decision', from: '9 days' },
      { value: '31%', label: 'fewer support contacts about application status' }
    ],
    source: 'Placeholder figures. Replace with instrumented values, the measurement window, and the sample size.'
  }
};

/** A change needs its prior value. A level does not. */
export const MixedLevelsAndChanges: S = {
  args: {
    items: [
      { value: '12s', label: 'median time to complete identity capture', from: '47s' },
      { value: '4.6/5', label: 'post-task confidence, measured in usability sessions' }
    ],
    source: 'Placeholder figures, shown to check the layout at two items.'
  }
};

/** Four is the ceiling. Past that it reads as a data dump rather than a claim. */
export const FourUp: S = {
  args: {
    items: [
      { value: '68%', label: 'completion in one sitting', from: '41%' },
      { value: '2.4 days', label: 'median time to decision', from: '9 days' },
      { value: '31%', label: 'fewer status contacts' },
      { value: '19', label: 'markets live at launch' }
    ],
    source: 'Placeholder figures, shown to check the four-column grid.'
  }
};
