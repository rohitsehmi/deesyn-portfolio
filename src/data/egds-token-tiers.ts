/**
 * The three-tier token diagram in `scaling-a-system`, as data.
 *
 * WHAT THIS IS. Every colour below is a value the picture DEPICTS — a swatch in
 * somebody else's design system — not a value this site renders in. That is the
 * whole reason they live here rather than in TokenTiers.css: a component
 * stylesheet in this repo contains no colour literals at all, and its published
 * contract says so in as many words ("Every value is a token reference, not a
 * literal"). Putting Expedia's yellow in a stylesheet would make that sentence
 * false for the sake of a picture. The component's own chrome — plates, rules,
 * type, connectors — is tokens end to end; the subject of the picture is data.
 *
 * Same distinction the banding system already draws. A band is relative and
 * flips with the theme; media is absolute, because a photograph does not change
 * colour when you turn the lights off. A depicted ramp is media.
 *
 * PROVENANCE. Sampled pixel by pixel from src/assets/egds-token-tiers-light.png,
 * the artwork this component replaces, so the recreation is measured rather than
 * remembered. That file's entry in design/asset-provenance.json is the record of
 * what it is, and one line of it governs everything here:
 *
 *   the swatches are ILLUSTRATIVE and carry NO hex values.
 *
 * An earlier pass of the artwork printed a legend of hex codes beside them and
 * it was cut, because those numbers were of unverified provenance and a number
 * on a page reads as a claim. Nothing here is rendered as text, and nothing here
 * should be. They are ramps of the right shape, not a published palette.
 *
 * The exception, and it is deliberate: the three brand accents and their button
 * fills are recognisably each company's own. That is the point being made —
 * one library, three brands — and it cannot be made in invented colours.
 */

import { EGDS_BRAND_MARKS } from './egds-brand-marks';

/** A tier's swatch. `hex` absent means an empty outline: a slot with no value yet. */
export interface TokenSwatch {
  label?: string;
  hex?: string;
  /**
   * The value printed under the swatch, when the tier prints values at all.
   *
   * READ THE PROVENANCE NOTE BEFORE ADDING THESE TO ANOTHER TIER. A colour on a
   * page is illustration; a hex printed beside it is a CLAIM, and an earlier
   * pass of this artwork had a legend of hex codes cut for exactly that reason —
   * the numbers were of unverified provenance. The six below are sampled from
   * the artwork, not read out of EGDS, and they are printed only on the
   * foundation tier, which is the one tier whose whole point is that it is raw
   * values. Replace them with the real ones the moment those are to hand.
   */
  value?: string;
}

export interface TokenTier {
  /** FOUNDATION TOKENS. Set in caps by the stylesheet, not typed in caps here. */
  title: string;
  /** The one-line gloss under it: "Raw values, platform agnostic". */
  gloss: string;
  /** `layers`, `mode` or `overlap` — which inline glyph sits beside the title. */
  glyph: TokenTierGlyph;
  /** Filled, tinted or outlined. The ladder is the argument: the last tier is empty. */
  weight: 'solid' | 'tinted' | 'outline';
  swatches: TokenSwatch[];
  /**
   * A plate that is DEPICTED rather than themed, as `{ bg, fg }`.
   *
   * The one place the "chrome is tokens" rule is deliberately suspended, and it
   * is suspended for the reason the rule exists. The foundation tier is drawn
   * near-black because it is the bedrock of the picture, not because the page
   * behind it happens to be white — so a token here flips it, and in dark mode
   * the loudest tier becomes a full-width white slab dropped into the middle of
   * an article. That is precisely the fault in the PNG this component replaced,
   * rebuilt in CSS and called a feature.
   *
   * So the plate is media: absolute, in both themes, from the same sampled
   * artwork as the swatches. Its foreground comes with it, and `currentColor`
   * carries that down to the gloss and the swatch rings, which is what keeps
   * them correct on a plate the page knows nothing about.
   */
  plate?: { bg: string; fg: string };
  /**
   * This tier's values come from whichever brand the reader has picked.
   *
   * Exactly one tier may say so, and it is the reason the diagram is worth
   * clicking: the slots sit empty until a brand fills them, which is the claim
   * the picture is making rather than a caption underneath it. The swatches
   * above still supply the six LABELS; a brand supplies the six values.
   */
  resolvesPerBrand?: boolean;
}

export type TokenTierGlyph = 'layers' | 'mode' | 'overlap';

export interface TokenTierBrand {
  name: string;
  /**
   * The brand's own favicon as a data URI, from `EGDS_BRAND_MARKS`.
   *
   * Fetched, never drawn. It replaced an initial in a coloured disc, which was
   * a deliberate second-best while no faithful set was available: Simple Icons
   * carries two of these three and not the third, and a mixed set reads as an
   * oversight rather than a decision. A favicon is the mark each company
   * publishes at its own root for exactly this purpose, so all three come from
   * one place and none of them is traced.
   */
  mark: string;
  /** Still the identity colour, and still what the selected column tints with. */
  accent: string;
  /**
   * The per-brand layer, IN THE SAME ORDER AS THE FEATURE TIER'S LABELS.
   *
   * That ordering is load-bearing and it was wrong at first. The tier above
   * names six slots — BG, Text, Border, Hover, Press, Disabled — and these six
   * fill them, so `feature[1]` IS the button's text colour and has to match the
   * button rendered at the foot of the column. The first pass took six colours
   * off the artwork in whatever order they appeared, which put a dark orange
   * under "Button Text" while the button below it plainly had black text. It
   * read as decoration because it was: a row of swatches nobody could check.
   * Now a reader can check it against the button, and it holds.
   */
  feature: string[];
  button: { bg: string; fg: string };
}

/**
 * The accent the depicted system resolves to, used to tint the plates.
 *
 * Not a fill. The plates are `color-mix(<accent> n%, transparent)` over whatever
 * band they land on, so in light mode the wash lands on the lavender the source
 * artwork used and in dark mode it tints the dark band instead of dropping a
 * white slab into the middle of the page — which is precisely what the PNG did,
 * and the reason it was rebuilt.
 */
export const DEPICTED_ACCENT = '#3E13DF';

/**
 * The foundation ramp, named once so the tier above can PRINT these values and
 * the tier below can REFERENCE them.
 *
 * That reference is the point and it used to be missing. Both rows were sampled
 * off the artwork independently, which left the semantic values a shade or two
 * off the foundation ones they were supposed to alias: On Primary was #030D28
 * beside a foundation #010A23, Border #9A9EB8 beside #9296AD. Nobody could see
 * it until the foundation tier started printing its hex values, and then the
 * diagram was quietly contradicting the architecture it was drawing, because a
 * reader could check "On Primary = #010A23?" and find it did not.
 *
 * A semantic token IS an alias. So these are one array now and the semantic row
 * indexes into it, which makes the relationship structural rather than two lists
 * that happen to agree — the same reason SHARED_SEMANTIC is passed once instead
 * of copied per brand.
 */
const FOUNDATION = ['#010A23', '#2E354B', '#646987', '#9296AD', '#CFCFD9', '#FFFFFF'];
const [INK, , , STEEL, MIST, WHITE] = FOUNDATION;

/**
 * Named once. The tier states these and all three brands repeat them unchanged.
 *
 * Four of the six alias the neutral ramp above. Primary and Primary Hover do
 * not, and that is information rather than an omission: an accent is the one
 * thing a neutral ramp cannot supply, which is exactly why the tier below it
 * exists for a brand to override.
 */
const SEMANTIC: TokenSwatch[] = [
  { label: 'Primary', hex: '#A99FFB' },
  { label: 'On Primary', hex: INK },
  { label: 'Surface', hex: WHITE },
  { label: 'Border', hex: STEEL },
  { label: 'Primary Hover', hex: DEPICTED_ACCENT },
  { label: 'Disabled', hex: MIST }
];

/**
 * The semantic row is one array, referenced three times.
 *
 * The diagram's claim is that these are identical across brands, so three copies
 * that happen to agree would be a claim maintained by hand — the failure this
 * repo has produced and fixed often enough to have a check for most of them.
 * Editing this list moves all three columns at once, which is the assertion.
 */
export const SHARED_SEMANTIC = SEMANTIC;

export const TIERS: TokenTier[] = [
  {
    title: 'Foundation tokens',
    gloss: 'Raw values, platform agnostic',
    glyph: 'layers',
    weight: 'solid',
    plate: { bg: '#0B1739', fg: '#FFFFFF' },
    /*
      Values rather than names, and that IS the tier's point: a foundation token
      has no meaning attached to it yet, so the only thing there is to say about
      it is what it is. The two tiers below name their slots instead, which is
      the difference the ladder is drawing.

      SAMPLED, NOT SOURCED — see TokenSwatch.value. These are read off the
      artwork this component replaced, so they are the right greys for the
      picture and are not EGDS's published neutrals.
    */
    swatches: FOUNDATION.map((hex) => ({ hex, value: hex }))
  },
  {
    title: 'Semantic tokens',
    gloss: 'Meaning for UI, mode aware',
    glyph: 'mode',
    weight: 'tinted',
    swatches: SEMANTIC
  },
  {
    title: 'Feature tokens',
    gloss: 'Component level',
    glyph: 'overlap',
    weight: 'outline',
    resolvesPerBrand: true,
    // No `hex`, and that is the whole diagram. This tier is the empty one; each
    // brand below fills the same six slots with its own values.
    swatches: [
      'Button BG', 'Button Text', 'Button Border', 'Button Hover', 'Button Press', 'Button Disabled'
    ].map((label) => ({ label }))
  }
];

/**
 * The three brands.
 *
 * THE MARKS ARE FETCHED, NOT DRAWN — see `mark` above and
 * design/build-brand-marks.mjs. They were initials in coloured discs until the
 * favicons were pulled in, which is the same move the service marks on
 * /how-this-was-built already made: someone else's logo is the one place
 * "close enough" is a real problem.
 *
 * `accent` survives that change and is not the mark's colour by accident. It is
 * the brand's IDENTITY, which is what a selected column tints with, and it is
 * deliberately not the same thing as the button colour underneath it. Expedia
 * is the case that proves it: yellow identity, blue primary action.
 */
export const BRANDS: TokenTierBrand[] = [
  /*
    THE ONLY ROW HERE THAT IS SOURCED RATHER THAN ILLUSTRATIVE, and correcting it
    is the clearest thing the real file taught this diagram.

    It used to render a yellow button, because yellow is the colour everyone
    thinks of as Expedia's. Yellow is `brand__1` on the brand page — the
    identity — and EGDS's primary button is `#1668E3`. Those being different is
    not a detail, it is the entire reason a feature layer exists: a brand's
    identity colour and the colour its primary action resolves to are two
    different questions, and a system that conflated them would need a fork
    rather than a token.

    So the disc above stays yellow and the button below is blue. Four of these
    six are sampled straight off the real component (rest, hover, active,
    disabled); Border is derived, since the real Secondary variant draws its
    edge from the neutral ramp rather than the brand.
  */
  {
    name: 'Expedia',
    mark: EGDS_BRAND_MARKS.Expedia,
    accent: '#FCBA02',
    feature: ['#1668E3', '#FFFFFF', '#1359C3', '#124CA4', '#0E3672', '#ABC9F5'],
    button: { bg: '#1668E3', fg: '#FFFFFF' }
  },
  /*
    Two values here are set for LEGIBILITY rather than fidelity, and both were
    caught by measuring rather than by looking.

    White on this red is 3.83:1 in the disc and 4.07:1 on the button — under AA
    for text at these sizes, in both themes, because a mid-luminance red is the
    one hue where white is not the safe choice. The disc takes a near-black
    letter instead (5.09:1); the button fill steps down 6% to #E22B37, which
    carries white at 4.54:1 and is still plainly Hotels.com's red.

    Nudging a depicted colour is a real cost and it is only acceptable because
    this row is illustrative, which the caption says on the page. Do NOT do the
    same to the Expedia row: those four values are sampled from the real
    component, and moving one to satisfy a checker would trade the only sourced
    thing in the picture for a number.
  */
  {
    name: 'Hotels.com',
    mark: EGDS_BRAND_MARKS['Hotels.com'],
    accent: '#F6343F',
    feature: ['#E22B37', '#FFFFFF', '#C2252F', '#A51F28', '#76161D', '#F5B3B7'],
    button: { bg: '#E22B37', fg: '#FFFFFF' }
  },
  {
    name: 'Vrbo',
    mark: EGDS_BRAND_MARKS.Vrbo,
    accent: '#054CC0',
    feature: ['#0043B5', '#FFFFFF', '#003A9C', '#003184', '#00235E', '#A3BBE4'],
    button: { bg: '#0043B5', fg: '#FFFFFF' }
  }
];

/**
 * The real thing, measured — and the reason the ramps above are shaped the way
 * they are rather than picked by eye.
 *
 * Rendered from `EGDS Components and Theming`, node `12622:11`, and sampled: the
 * primary button runs rest `#1668E3`, hover `#124CA4`, active `#0E3672`,
 * disabled `#ABC9F5`, label white. Expressed as ratios against rest, that ramp
 * is hover x0.73, active x0.52, and disabled 36% of rest over white — which is
 * what every brand row above is built from. Checked by re-deriving EGDS's own
 * ramp from its own rest colour: disabled comes back exact, hover and active
 * within two points. So the STRUCTURE of each row is measured from the real
 * component even where the hue is not.
 *
 * Two things it also settled. The button is a pill at every size, which the
 * artwork already had right. And the real set is Primary / Secondary / Tertiary
 * / Overlay across S, M, L with rest, hover and active — so "Button Press" in
 * the feature row is EGDS's "active"; the label is kept because it is the one a
 * reader outside Expedia will recognise.
 */
export const EGDS_PRIMARY_BUTTON = {
  rest: '#1668E3', hover: '#124CA4', active: '#0E3672', disabled: '#ABC9F5', label: '#FFFFFF'
};

/**
 * The two row labels repeated under every brand.
 *
 * Here rather than in src/copy, with the rest of the diagram's labels, because
 * a label and the row it names are one datum. Split across two files and the
 * copy editor can rename "Semantic tokens (same)" while the swatches under it
 * stay identical, which turns the diagram's only claim into a caption that
 * happens to agree with it.
 */
export const BRAND_ROW_LABELS = {
  shared: 'Semantic tokens (same)',
  perBrand: 'Feature tokens (per brand)'
};

/**
 * The group label on the brand picker, for a screen reader only.
 *
 * The three columns are a radio group, so something has to name what is being
 * chosen. On screen the caption says it in prose and the columns are plainly a
 * set of three; announced, "radio button, 1 of 3" with no group name is a
 * choice with no question attached to it.
 */
export const BRAND_PICKER_LEGEND = 'Resolve the feature layer for a brand';

/** The base component every tier resolves for. */
export const BASE_COMPONENT = { eyebrow: 'Base component (EGDS)', name: 'Button' };

/**
 * The line under the stack, and the argument the whole picture is making.
 *
 * Two sentences rather than the artwork's dash, which is a house style thing
 * and not a redraw: nothing on this site sets an em dash.
 */
export const TIER_NOTE =
  'Foundation and semantic identical. Only the feature layer resolves per brand.';
