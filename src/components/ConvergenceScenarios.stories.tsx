import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConvergenceScenarios } from './ConvergenceScenarios';
import {
  CONVERGENCE_NOTES, CONVERGENCE_SCENARIOS, CONVERGENCE_TRADE
} from '../data/egds-convergence-scenarios';

const meta = { title: 'Content/Convergence Scenarios', component: ConvergenceScenarios } satisfies Meta<typeof ConvergenceScenarios>;
export default meta;
type S = StoryObj<typeof meta>;

const args = {
  alt: 'A scale of five convergence scenarios, least ambitious at the top. The two ends are named, the three between them are drawn as positions, a bracket marks the middle as what the leads recommended, and the bottom rung is marked as the one the business chose.',
  scenarios: CONVERGENCE_SCENARIOS,
  trade: CONVERGENCE_TRADE,
  notes: CONVERGENCE_NOTES
};

/**
 * The scale as it ships. The three unnamed rungs are the point rather than an
 * omission: the record names the two ends and says the recommendation was one of
 * the middle options, and naming the rest would be inventing the contents of a
 * real artefact.
 */
export const Default: S = { args };

/**
 * No recommendation marked, which is what to render where only the range and the
 * choice matter. The bracket disappears with the run it was derived from rather
 * than needing a second flag turned off.
 */
export const RangeAndChoice: S = {
  args: { ...args, scenarios: CONVERGENCE_SCENARIOS.map(({ recommended, ...s }) => s) }
};
