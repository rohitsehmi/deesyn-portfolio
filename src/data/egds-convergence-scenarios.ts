/**
 * The five convergence scenarios in `scaling-a-system`, as data.
 *
 * WHICH KIND OF DIAGRAM THIS IS. A structure, like the governance ladder and the
 * component models, and not somebody else's palette like the token tiers. So
 * every tone is a token, it repaints with the brand pack, and there is nothing
 * in it that can go stale.
 *
 * PROVENANCE, AND IT IS THE WHOLE REASON THIS FILE IS SHAPED THIS WAY. The
 * record names two of the five and no more: the process section says the range
 * ran "from keeping the four systems independent on shared foundational tokens
 * through to a single enterprise system with the organisation re-platformed onto
 * it", and that the leads "recommended one of the middle options" while the
 * business "chose the most ambitious".
 *
 * So the two ends carry a label and the middle three carry none. Naming them
 * would be inventing the content of a real artefact, which is precisely what
 * this study archived itself for twelve days to avoid, and it is the same
 * hazard as the four `nca-*` reconstructions recorded in
 * design/asset-provenance.json. AN UNLABELLED RUNG IS NOT A GAP HERE, IT IS THE
 * SHAPE OF WHAT IS KNOWN — the argument the exploration makes is that a spectrum
 * existed, that the recommendation sat in the middle of it and that the business
 * took the far end, and none of that needs the middle three named.
 *
 * For the same reason the recommendation is drawn as a SPAN across the middle
 * three rather than as a mark on one of them. "One of the middle options" is
 * genuinely vague in the record, and a bracket says that exactly where a dot
 * would be a claim about which.
 *
 * ONE THING TO SETTLE WITH ROHIT, and the diagram is what surfaced it. The
 * exploration says the recommended middle option "kept the four systems
 * independent on a shared token foundation", which is close to word for word how
 * the process paragraph describes the LEAST ambitious end of the range. Both can
 * be true — a middle option can keep the systems independent while sharing more
 * than foundations — but as written the two sentences read as the same thing in
 * two different positions on the scale. The title says "middle" outright, which
 * is why the figure is built that way; if the recommendation was really the low
 * end, the fix is to move `recommended` down one rung here.
 */

export interface ConvergenceScenario {
  /**
   * Named only where the record names it, which is the two ends.
   *
   * Absent means the rung is drawn as a position on the scale and nothing else.
   * See the provenance note above before adding one.
   */
  label?: string;
  /**
   * Part of the span the recommendation sat somewhere inside.
   *
   * A run rather than a single flag, because the record says "one of the middle
   * options" and does not say which. The component derives the bracket's start,
   * middle and end from the run, so moving a rung in or out of it is one edit
   * here rather than three.
   */
  recommended?: boolean;
  /** The one the business took. At most one. */
  chosen?: boolean;
}

/**
 * Least ambitious FIRST, so reading down the page is reading along the scale.
 *
 * That direction is taken from the sentence the figure illustrates, which runs
 * "from keeping the four systems independent ... through to a single enterprise
 * system". Reversing it would put the ending first and make the picture argue
 * with the paragraph beside it.
 */
export const CONVERGENCE_SCENARIOS: ConvergenceScenario[] = [
  { label: 'Four systems independent, on shared foundational tokens' },
  { recommended: true },
  { recommended: true },
  { recommended: true },
  { label: 'One enterprise system, the organisation re-platformed onto it', chosen: true }
];

/**
 * The trade-off, as the two poles of the scale.
 *
 * Both are the exploration's own words: the option it recommended was "far
 * cheaper to reverse", and full re-platforming made the abandoned rebuild
 * "something we could walk away from" no longer. They are axis labels rather
 * than per-rung values, deliberately, because the record gives a direction and
 * not a measurement, and five bars would draw numbers nobody has.
 */
export const CONVERGENCE_TRADE = {
  start: 'Cheapest to reverse',
  end: 'Hardest to walk away from'
};

/** The two annotations, and the only prose in the picture. */
export const CONVERGENCE_NOTES = {
  recommended: 'We recommended one of these',
  chosen: 'The business chose this'
};
