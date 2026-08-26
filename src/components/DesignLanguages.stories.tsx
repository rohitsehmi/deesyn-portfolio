import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesignLanguages } from './DesignLanguages';
import {
  DESIGN_LANGUAGES, DESIGN_LANGUAGES_LABELS, LEDGER, SHARED_RAMPS
} from '../data/egds-design-languages';

const meta = { title: 'Content/Design Languages', component: DesignLanguages } satisfies Meta<typeof DesignLanguages>;
export default meta;
type S = StoryObj<typeof meta>;

const args = {
  alt: 'Three brands side by side, each showing the few values it declares on its own, above one shared block of four ramps that all three declare identically.',
  languages: DESIGN_LANGUAGES,
  shared: SHARED_RAMPS,
  ledger: LEDGER,
  labels: DESIGN_LANGUAGES_LABELS
};

/**
 * What shipped: each brand's own handful of values, over one shared foundation.
 * The asymmetry is the point and it is visible before anything is clicked.
 */
export const Default: S = { args };

/**
 * The abandoned plan, which a reader reaches by clicking and Chromatic never
 * would: the shared set copied into every brand, three identical stacks at once.
 */
export const Duplicated: S = { args: { ...args, defaultDuplicated: true } };
