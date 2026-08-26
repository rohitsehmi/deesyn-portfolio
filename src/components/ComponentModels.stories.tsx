import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentModels } from './ComponentModels';
import {
  COMPONENT_DECISIONS, COMPONENT_MODELS, COMPONENT_MODELS_BASE,
  COMPONENT_MODELS_CHANGE, COMPONENT_MODELS_SUBJECT, DESIGN_LANGUAGES
} from '../data/egds-component-models';

const meta = { title: 'Content/Component Models', component: ComponentModels } satisfies Meta<typeof ComponentModels>;
export default meta;
type S = StoryObj<typeof meta>;

const args = {
  alt: 'Two component structures side by side. On the left, one date picker holding four blocks, one per design language, each carrying the same four decisions. On the right, four brand token sets carrying look alone, feeding one base date picker that holds the other three decisions once.',
  subject: COMPONENT_MODELS_SUBJECT,
  languages: DESIGN_LANGUAGES,
  decisions: COMPONENT_DECISIONS,
  models: COMPONENT_MODELS,
  base: COMPONENT_MODELS_BASE,
  change: COMPONENT_MODELS_CHANGE
};

/**
 * The two structures, which is the resting state. The fidelity cost is already
 * visible without touching anything: only one of the four decisions moves out to
 * the brand chips on the right.
 */
export const Default: S = { args };

/**
 * The count, which a reader reaches by clicking and Chromatic never would: the
 * marked row appears four times on the left and once on the right, which is the
 * exploration's sentence about changes landing in four places at once.
 */
export const OneChange: S = { args: { ...args, defaultChanged: true } };

/**
 * No `change`, so no control and no marks. The figure is the two structures and
 * nothing else, which is what to render anywhere the cost of a change is not the
 * subject.
 */
export const StructuresOnly: S = { args: { ...args, change: undefined } };
