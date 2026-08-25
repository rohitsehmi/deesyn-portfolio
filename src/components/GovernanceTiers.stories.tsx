import type { Meta, StoryObj } from '@storybook/react-vite';
import { GovernanceTiers } from './GovernanceTiers';
import {
  GOVERNANCE_REJECTED, GOVERNANCE_STAGES, GOVERNANCE_TIERS
} from '../data/egds-governance-tiers';

const meta = { title: 'Content/Governance Tiers', component: GovernanceTiers } satisfies Meta<typeof GovernanceTiers>;
export default meta;
type S = StoryObj<typeof meta>;

const args = {
  alt: 'Three panels showing a component climbing the governance ladder, from a team workspace to the shared tier to core, with a gate in front of each step.',
  stages: GOVERNANCE_STAGES,
  tiers: GOVERNANCE_TIERS,
  rejected: GOVERNANCE_REJECTED
};

/**
 * The shipped model, which is the resting state: three tiers, three gates, and
 * a component that has reached the first of them.
 */
export const Default: S = { args };

/**
 * The rejected model, which a reader reaches by clicking and Chromatic never
 * would. The gates are struck rather than dimmed — dimming would take the one
 * element whose job is to be read under AA — and the dashed route goes round
 * the shared tier rather than through it.
 */
export const RejectedPath: S = { args: { ...args, defaultRejected: true } };

/**
 * No `rejected`, so no control and no dashed route. The figure is the shipped
 * ladder and nothing else, which is what to render anywhere the rejected path
 * is not the subject.
 */
export const LadderOnly: S = { args: { ...args, rejected: undefined } };
