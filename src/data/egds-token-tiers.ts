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
 * PROVENANCE — REWRITTEN 2026-08-26, AND THE DIRECTION OF TRAVEL IS THE POINT.
 * Every value here used to be sampled pixel by pixel from
 * src/assets/egds-token-tiers-light.png, and the note in this spot said the
 * swatches were ILLUSTRATIVE and that a printed hex reads as a claim nobody
 * could check. All of that was the right caution for sampled values.
 *
 * They are not sampled any more. They are read out of the live Figma file
 * `Foundations`, `ftO20wB1T5EAIOulXsHeDQ`, with `get_variable_defs` against the
 * three brand instances — see src/data/egds-design-languages.ts, which carries
 * the node ids and the method and is the figure this one now has to agree with.
 * So the hexes ARE printed, and a reader can check them.
 *
 * WHAT THE SOURCE CHANGED, beyond values. The old figure gave each brand its own
 * primary button and said "only the feature layer resolves per brand". Neither
 * survives the file: all three brands declare the action ramp identically, and
 * what differs between them is a block of raw values at the foundation tier. The
 * tier that sits empty until a brand is picked is therefore the first one now,
 * not the last, and the three buttons are one colour.
 *
 * The PNG is kept rather than deleted, and design/asset-provenance.json still
 * records what it is. It is the thing this was measured from before there was
 * anything better.
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

/** Declared before DEPICTED_ACCENT because that is now an alias of it. */
const ACTION_TINT = '#1668E3';

/**
 * The accent the depicted system resolves to, used to tint the plates.
 *
 * Not a fill. The plates are `color-mix(<accent> n%, transparent)` over whatever
 * band they land on, so in light mode the wash lands on the lavender the source
 * artwork used and in dark mode it tints the dark band instead of dropping a
 * white slab into the middle of the page — which is precisely what the PNG did,
 * and the reason it was rebuilt.
 */
export const DEPICTED_ACCENT = ACTION_TINT;

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
const FOUNDATION = ['#0C0E1C', '#31374F', '#676A7D', '#999CA8', '#CACCD2', '#F3F3F5'];
const [INK, , , STEEL, MIST, PAPER] = FOUNDATION;
const WHITE = '#FFFFFF';

/**
 * The action ramp, and the single most consequential thing the real file taught
 * this diagram.
 *
 * All three brands declare it BYTE-IDENTICAL. So the primary action is not a
 * per-brand value at all, and the earlier version of this figure — which gave
 * Expedia a blue button, Hotels.com a red one and Vrbo a navy one — was drawing
 * a difference that is not there. Expedia's real button, sampled from the
 * Components file, is exactly this ramp's 600 step; there is one Button in the
 * library with one binding; therefore all three resolve here.
 */
const ACTION = { rest: '#1668E3', hover: '#0D4EAF', press: '#0E3672', muted: '#A6C9F7' };

/**
 * Named once. The tier states these and all three brands repeat them unchanged.
 *
 * Four of the six alias the neutral ramp above; Primary and Primary Hover come
 * from the action ramp. THAT USED TO BE THE OTHER WAY ROUND and the correction
 * is the point of this revision: the note here said an accent was the one thing
 * a neutral ramp cannot supply, "which is exactly why the tier below it exists
 * for a brand to override". The real file says the action ramp is declared
 * identically by all three brands, so an accent is not a brand's to supply
 * either. What a brand supplies is its own block of raw values, which is why the
 * tier that resolves per brand is now the FIRST one.
 */
const SEMANTIC: TokenSwatch[] = [
  { label: 'Primary', hex: ACTION.rest },
  { label: 'On Primary', hex: WHITE },
  /*
    Surface takes the lightest neutral rather than white, and Disabled the next
    step up from it, because the first pass put white on both On Primary and
    Surface and #F3F3F5 on Disabled — three near-white circles in a row of six,
    which is accurate and unreadable. Every value here is still a real step of
    the shared neutral ramp; the separation comes from picking different ones,
    not from inventing any.
  */
  { label: 'Surface', hex: PAPER },
  { label: 'Border', hex: STEEL },
  { label: 'Primary Hover', hex: ACTION.hover },
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

/**
 * The six slots a brand actually sets, in the order every brand's block below
 * fills them.
 *
 * Named in plain English rather than with the EGDS token names, which is the
 * decision already taken for the design-languages figure and holds here for the
 * same reason: a reader outside Expedia learns nothing from an internal
 * namespace out of a private file.
 */
const BRAND_BLOCK = ['Identity', 'Surface', 'Ink', 'Wash', 'Edge', 'Tint'];

export const TIERS: TokenTier[] = [
  {
    title: 'Foundation tokens',
    gloss: 'Raw values. Shared ramps, plus a block each brand sets',
    glyph: 'layers',
    weight: 'outline',
    resolvesPerBrand: true,
    /*
      THE EMPTY TIER MOVED HERE FROM THE BOTTOM, and that is the whole revision.

      It sat on the feature tier, so the picture said a brand differentiates
      itself at component level. The real foundation files say the opposite: the
      neutral, action, success and error ramps are declared identically by all
      three brands, and what differs is a block of raw values — identity,
      surface, and four more. So the slot a brand fills is a foundation slot, and
      the tiers below it resolve the same however the picker is set.

      The copy was never wrong about this. It says "a brand differentiates itself
      by overriding tokens rather than rewriting components", and never says
      which tier. Only this figure's note did.
    */
    swatches: BRAND_BLOCK.map((label) => ({ label }))
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
    weight: 'solid',
    /*
      THE PLATE MOVED WITH THE ARGUMENT. It was on the foundation tier because
      that was "the bedrock of the picture"; the bedrock is now the row that
      actually paints the button, sitting directly above the three buttons it
      paints. The reasoning for it being DEPICTED rather than themed is unchanged
      and still governs — see TokenTier.plate.
    */
    plate: { bg: '#0B1739', fg: '#FFFFFF' },
    /*
      Values printed, because this row is the checkable claim: a reader can read
      #1668E3 here and see it on all three buttons below. The tier above prints
      none, since a slot with no brand picked has nothing to print.
    */
    swatches: [
      { label: 'Button BG', hex: ACTION.rest, value: ACTION.rest },
      { label: 'Button Text', hex: WHITE, value: WHITE },
      { label: 'Button Border', hex: ACTION.rest, value: ACTION.rest },
      { label: 'Button Hover', hex: ACTION.hover, value: ACTION.hover },
      { label: 'Button Press', hex: ACTION.press, value: ACTION.press },
      { label: 'Button Disabled', hex: ACTION.muted, value: ACTION.muted }
    ]
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
    EVERY VALUE IN THIS LIST IS NOW SOURCED, read out of the live Figma file
    `Foundations` (`ftO20wB1T5EAIOulXsHeDQ`) on 2026-08-26 — see
    src/data/egds-design-languages.ts for the node ids and the method.

    Three things were wrong before and all three were sampled off a PNG:
    the identity colours were 27 to 58 apart in RGB distance from the real ones;
    the six-value block was a per-brand button ramp; and the buttons were blue,
    red and navy.

    THE BUTTONS ARE THE SAME BLUE NOW, and that is a correction rather than a
    simplification. All three brands declare the action ramp identically, there
    is one Button in the library with one binding, and Expedia's real button is
    that ramp's 600 step exactly. Three different buttons was a difference the
    system does not have. What a brand does change is the block above.
  */
  {
    name: 'Expedia',
    mark: EGDS_BRAND_MARKS.Expedia,
    accent: '#FDDB32',
    feature: ['#FDDB32', '#FFF9D9', '#292929', '#EFF3F7', '#C8DFF9', '#7CB6B0'],
    button: { bg: ACTION.rest, fg: WHITE }
  },
  {
    name: 'Hotels.com',
    mark: EGDS_BRAND_MARKS['Hotels.com'],
    accent: '#E61E43',
    feature: ['#E61E43', '#FBECE9', '#311A32', '#F8F3E7', '#EAE3D2', '#81B9BF'],
    button: { bg: ACTION.rest, fg: WHITE }
  },
  {
    name: 'Vrbo',
    mark: EGDS_BRAND_MARKS.Vrbo,
    accent: '#006ED6',
    feature: ['#006ED6', '#EBF5FF', '#23272B', '#F7F7F8', '#AED1F3', '#FF9A65'],
    button: { bg: ACTION.rest, fg: WHITE }
  }
];

/**
 * The real thing, measured — and the reason the ramps above are shaped the way
 * they are rather than picked by eye.
 *
 * Rendered from `EGDS Components and Theming`, node `12622:11`, and sampled: the
 * primary button came off that render as rest `#1668E3`, hover `#124CA4`, active
 * `#0E3672`, disabled `#ABC9F5`, label white.
 *
 * THE RATIOS THAT USED TO BE RECORDED HERE WERE A WILD GOOSE CHASE. This spot
 * described the ramp as "hover x0.73, active x0.52, disabled 36% over white", as
 * though the button derived its states arithmetically from its rest colour.
 * Against the variables it does nothing of the kind: rest and active are the
 * action ramp's 600 and 800 steps EXACTLY, and hover and disabled are 12 and 5
 * away from its 700 and 200 — the distance you would expect from reading colours
 * off a rendered PNG rather than out of the file. There is no ratio. There is a
 * ramp, and the button uses four of its steps.
 *
 * Two things it also settled, both still true. The button is a pill at every
 * size, which the artwork already had right. And the real set is Primary /
 * Secondary / Tertiary / Overlay across S, M, L with rest, hover and active — so
 * "Button Press" above is EGDS's "active"; the label is kept because it is the
 * one a reader outside Expedia will recognise.
 *
 * Two things it also settled. The button is a pill at every size, which the
 * artwork already had right. And the real set is Primary / Secondary / Tertiary
 * / Overlay across S, M, L with rest, hover and active — so "Button Press" in
 * the feature row is EGDS's "active"; the label is kept because it is the one a
 * reader outside Expedia will recognise.
 */
export const EGDS_PRIMARY_BUTTON = {
  rest: ACTION.rest, hover: ACTION.hover, active: ACTION.press, disabled: ACTION.muted, label: WHITE
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
  perBrand: 'Raw values (per brand)'
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
  'Semantic and feature resolve the same in all three. What a brand sets is its own block of raw values.';
