import type { Meta, StoryObj } from '@storybook/react-vite';
import { TokenTiers } from './TokenTiers';
import {
  BASE_COMPONENT, BRANDS, BRAND_PICKER_LEGEND, BRAND_ROW_LABELS, DEPICTED_ACCENT,
  SHARED_SEMANTIC, TIERS, TIER_NOTE
} from '../data/egds-token-tiers';

const meta = { title: 'Content/Token Tiers', component: TokenTiers } satisfies Meta<typeof TokenTiers>;
export default meta;
type S = StoryObj<typeof meta>;

const args = {
  alt: 'A diagram of the three token tiers. A base Button component feeds a foundation row of raw greys, then a semantic row naming them, then a feature row of empty outlines. Below, three brands fill the same six feature slots with their own values and render the same button in yellow, red and blue.',
  base: BASE_COMPONENT,
  tiers: TIERS,
  note: TIER_NOTE,
  brands: BRANDS,
  sharedSemantic: SHARED_SEMANTIC,
  rowLabels: BRAND_ROW_LABELS,
  pickerLegend: BRAND_PICKER_LEGEND,
  tint: DEPICTED_ACCENT,
  caption: 'Pick a brand: it overrides values rather than components, so one library renders as many brands.'
};

/**
 * Switch the band and the theme in the toolbar. The chrome moves and the
 * swatches do not, which is the whole rule: what the diagram is made of is
 * relative, and what it is about is absolute.
 */
export const Default: S = { args };

/**
 * No `tint`. The middle tier falls back to an outline, so the ladder still
 * reads — the picture degrades rather than losing a plate to a colour it does
 * not have.
 */
export const Untinted: S = { args: { ...args, tint: undefined } };

/**
 * A brand already resolved, which is the state a reader gets to by clicking and
 * Chromatic never would: it photographs a page rather than operating one. So the
 * second half of the interaction is a story rather than a note saying it works.
 *
 * The feature tier has values in it, its plate and the base component's border
 * have taken Hotels.com's red, and the semantic row above has not moved a pixel
 * — which is the entire argument the diagram is making.
 */
export const Resolved: S = { args: { ...args, defaultBrand: 'Hotels.com' } };
