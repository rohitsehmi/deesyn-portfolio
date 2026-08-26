/**
 * The two component structures compared in `scaling-a-system`, as data.
 *
 * WHICH KIND OF DIAGRAM THIS IS, because that decides everything else. The
 * token-tiers figure depicts somebody else's palette, so its values are data and
 * absolute; this one depicts a STRUCTURE, the same family as the governance
 * ladder beside it. A structure has no colour of its own, so every tone comes
 * from the page's own tokens, the whole picture repaints with the brand pack,
 * and there is nothing in here that can go stale.
 *
 * WHY THE LABELS LIVE HERE AND NOT IN src/copy. Same reason as the other two: a
 * diagram's labels are parts of a picture rather than prose, and a label
 * separated from the thing it names can be edited into disagreeing with it. The
 * figure's alt text stays in the copy file, because that is a sentence somebody
 * reads.
 *
 * PROVENANCE, which is stricter on this study than anywhere else on the site.
 * The four design languages are named in the problem section and are the real
 * four: Expedia, Hotels.com, Vrbo, and the partner and supply side. The four
 * DECISIONS are a characterisation rather than EGDS's own taxonomy, and they are
 * supportable from the study's own prose, which says each system had "its own
 * date picker, its own search field and its own interpretation of what
 * accessible meant", and that a Vrbo date picker was built for whole homes by
 * the week rather than rooms by the night. Nothing here is a published name, a
 * value, or a number, so there is no claim in the picture to get wrong — which
 * is exactly why it carries no caption, unlike the token-tiers figure whose
 * swatches are colours and therefore need one.
 */

/** The component the picture is drawn about. Named in the problem section. */
export const COMPONENT_MODELS_SUBJECT = 'Date picker';

/**
 * The four design languages, in the order the problem section names them.
 *
 * NO MARKS AND NO ACCENTS, deliberately, and it is not an omission. The
 * token-tiers figure uses each company's own favicon because its subject IS
 * brand identity; this one's subject is where a decision lives, and three logos
 * beside a fourth entry that has no logo would read as an oversight rather than
 * as the partner side genuinely not being a consumer brand.
 */
export const DESIGN_LANGUAGES = [
  'Expedia', 'Hotels.com', 'Vrbo', 'Partner and supply'
];

export interface ComponentDecision {
  /** "Behaviour". Set in caps by nothing; it renders as written. */
  label: string;
  /**
   * This decision moves out of the component and into a brand's tokens.
   *
   * Exactly one, and it is the fidelity cost the exploration admits to in
   * words: what shipped lets a brand differ on how a component LOOKS and not on
   * how it is built. Drawing that is the honest half of the comparison, since
   * the right-hand model is otherwise all upside.
   */
  perBrand?: boolean;
  /**
   * A change to the component lands on this row.
   *
   * The whole argument, and the reason the figure has a control at all: the
   * exploration says every later change had to be correct in four places at
   * once, and this is that sentence as something to look at rather than read.
   * Marked once here and rendered wherever the row appears, which is four times
   * on the left and once on the right.
   */
  changes?: boolean;
}

export const COMPONENT_DECISIONS: ComponentDecision[] = [
  { label: 'Structure' },
  { label: 'Behaviour', changes: true },
  { label: 'Accessibility' },
  { label: 'Look', perBrand: true }
];

export interface ComponentModelLabels {
  /** "The original plan". */
  label: string;
  /** The one line under it, which is the whole difference between the two. */
  gloss: string;
}

/**
 * The two headers.
 *
 * The abandoned model is on the LEFT and that is chronological rather than
 * rhetorical: it was the plan first, and the reader has just been told it was
 * abandoned partway through. Putting what shipped first would make the picture
 * argue with the paragraph beside it.
 */
export const COMPONENT_MODELS: { abandoned: ComponentModelLabels; shipped: ComponentModelLabels } = {
  abandoned: {
    label: 'The original plan',
    gloss: 'Four design languages inside every component'
  },
  shipped: {
    label: 'What shipped',
    gloss: 'One base component, brand tokens on top'
  }
};

/** The eyebrow on the shipped model's component, naming whose component it is. */
export const COMPONENT_MODELS_BASE = 'Base (EGDS)';

/**
 * The control, and the one label on the figure that is an instruction.
 *
 * It names a change to BEHAVIOUR rather than to the look, and that is the only
 * choice that makes the comparison fair: a change to the look genuinely does
 * land in one place per brand in both models, so marking it would show two
 * structures agreeing and prove nothing.
 */
export const COMPONENT_MODELS_CHANGE = { toggle: 'Change how the component behaves' };
