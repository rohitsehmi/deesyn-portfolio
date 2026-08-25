/**
 * The three governance tiers in `scaling-a-system`, as data.
 *
 * WHY THE LABELS LIVE HERE AND NOT IN src/copy. Same reason as
 * egds-token-tiers.ts: a diagram's labels are not prose, they are parts of a
 * picture, and a label separated from the thing it names can be edited into
 * disagreeing with it. The figure's alt text stays in the copy file, because
 * that is a sentence somebody reads and it is what the reading time counts as a
 * figure.
 *
 * WHAT IS NOT HERE, deliberately: the three captions the prototype carried under
 * each panel. The exploration this sits inside already spends ninety words
 * explaining the model, immediately beside it, so a caption per panel would be
 * the same argument twice at two different sizes. The panels carry labels; the
 * prose carries the reasoning.
 *
 * NO COLOURS AT ALL, which is the difference from the token-tiers diagram and
 * worth stating. That one depicts somebody else's palette, so its values are
 * absolute data. This depicts a PROCESS — tiers, gates, a path — and a process
 * has no colour of its own. So every tone comes from the page's own tokens, it
 * repaints with the brand pack, and there is nothing in here to go stale.
 */

/** Which tier a node sits at. Order matters: it is the ladder. */
export type GovernanceTier = 'team' | 'shared' | 'core';

export interface GovernanceStage {
  /** "Team tier". Set in caps by the stylesheet. */
  label: string;
  /** How far the component has travelled by this panel. */
  reached: GovernanceTier;
  /**
   * The gate crossed to get here, in one word.
   *
   * These are the whole point of the picture. The rejected model in the
   * exploration beside it is this same ladder with the gates taken out, which is
   * why the toggle removes them rather than explaining their absence.
   */
  gate: string;
}

export const GOVERNANCE_STAGES: GovernanceStage[] = [
  { label: 'Team tier', reached: 'team', gate: 'Test' },
  { label: 'Shared tier', reached: 'shared', gate: 'Promote' },
  { label: 'Core tier', reached: 'core', gate: 'Merge' }
];

/** The tier names, drawn once per panel. Two teams, because one cannot show a shared tier. */
export const GOVERNANCE_TIERS = { core: 'Core', shared: 'Shared', team: 'Team' };

/** The control, and the one label on the figure that is an instruction. */
export const GOVERNANCE_REJECTED = { toggle: 'Show the rejected path' };
