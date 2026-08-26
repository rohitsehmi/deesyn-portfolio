/**
 * The EGDS per-brand foundations, as data, for the first exploration on
 * `scaling-a-system`.
 *
 * SOURCED, NOT SAMPLED, AND THAT IS THE DIFFERENCE FROM egds-token-tiers.ts.
 * Every value below was read out of the live Figma file `Foundations`,
 * `ftO20wB1T5EAIOulXsHeDQ`, on 2026-08-26, with `get_variable_defs` against the
 * three brand instances on `0:1`: Expedia `1:3100`, Vrbo `1:5969`, Hotels
 * `1:7206`. The token-tiers figure beside this one is pixel-sampled from a PNG
 * and says so; this one is not, and the caption on the page says THAT.
 *
 * HOW "SHARED" IS KNOWN RATHER THAN ASSERTED. In that response a variable whose
 * name is prefixed `Unspecified / ` is one the brand does not declare, and which
 * falls back to the neutral of the same tint — the foundation template says so in
 * its own caption. So declared-versus-inherited is readable per brand, and the
 * counts below are computed from it rather than eyeballed.
 *
 * NO EGDS TOKEN NAMES ARE RENDERED, and that is a decision already taken rather
 * than an oversight: a reader outside Expedia learns nothing from
 * `color__accent__1__600`, the row is measured to the pixel, and an internal
 * namespace out of a private file is the disclosure this study cuts everywhere
 * else. The labels here are plain English for the same slot. The VALUES are a
 * different matter — a brand's identity colour is on its home page.
 *
 * NO TYPE SPECIMEN, FOR THE REASON A HAND-TRACED LOGO IS A WRONG LOGO. Reckless
 * XPD, Recoleta and Lardent Pro Slab are licensed and not installed here, so
 * setting "Aa" in a substitute would show three faces that are not the ones EGDS
 * ships. The face is NAMED and not drawn.
 */

export interface DesignLanguage {
  name: string;
  /** `color__brand__1`. The one value everybody recognises. */
  identity: string;
  /** `color__brand__4`. The pale wash each brand lays its identity on. */
  surface: string;
  /** The display face. Named, never set — see the note above. */
  display: string;
  /**
   * True where the brand pushes its display face through the whole headline
   * range as well. Only Hotels.com does, which is the one typographic decision
   * in this set that is a different KIND of choice rather than a different value.
   */
  displayLeadsHeadlines?: boolean;
}

/** Left to right in the order the problem section names them. */
export const DESIGN_LANGUAGES: DesignLanguage[] = [
  { name: 'Expedia', identity: '#FDDB32', surface: '#FFF9D9', display: 'Reckless XPD' },
  { name: 'Hotels.com', identity: '#E61E43', surface: '#FBECE9', display: 'Recoleta', displayLeadsHeadlines: true },
  { name: 'Vrbo', identity: '#006ED6', surface: '#EBF5FF', display: 'Lardent Pro Slab' }
];

export interface SharedRamp {
  /** Plain English, never the EGDS token name. */
  label: string;
  steps: string[];
}

/**
 * The four ramps all three brands declare with byte-identical values.
 *
 * These are the mass of the picture and the whole argument: the thing the
 * abandoned plan would have carried a copy of inside every component.
 */
export const SHARED_RAMPS: SharedRamp[] = [
  {
    label: 'Neutral',
    steps: ['#191E3B', '#31374F', '#4D5167', '#676A7D', '#818494',
            '#999CA8', '#B1B3BD', '#CACCD2', '#DFE0E4', '#F3F3F5']
  },
  {
    label: 'Action',
    steps: ['#181F3E', '#0E3672', '#0D4EAF', '#1668E3', '#3D84F0',
            '#649DF2', '#80B2F4', '#A6C9F7', '#C8DFF9', '#ECF4FD']
  },
  {
    label: 'Success',
    steps: ['#022623', '#043F3B', '#105D4A', '#227950', '#359656',
            '#46B05C', '#57CA61', '#8FDE96', '#BEECC6', '#E6F7E9']
  },
  {
    label: 'Error',
    steps: ['#420E1B', '#6C172C', '#A7183C', '#D11544', '#E61E43',
            '#F55669', '#FC8D96', '#FDB4BA', '#FED5D8', '#FFEFEF']
  }
];

/**
 * The counts, COMPUTED from the three variable dumps rather than typed.
 *
 * 84 = the 40 swatches above, plus black, plus the three brand slots all three
 * set to the same navy and blue, plus a 40-value partner ramp none of them
 * touches. 10 is every token all three declare and disagree on: identity,
 * surface, the near-black and the two pale washes each lays over it, and two
 * decorative accents.
 *
 * `shared + differs` is deliberately not the whole union: 83 more are declared by
 * one or two brands and inherited by the rest, which is neither shared nor a
 * disagreement, and rounding it into either would be the flattering version.
 */
export const LEDGER = {
  shared: 84,
  differs: 10,
  partial: 83,
  union: 177,
  /** Everything below colour, identical in all three. */
  invariant: 'Type scale, radius, spacing, sizing and elevation are identical in all three.'
};

export const DESIGN_LANGUAGES_LABELS = {
  identity: 'Identity',
  surface: 'Surface',
  display: 'Display face',
  headlines: 'and its headlines',
  own: 'Its own',
  shared: 'Shared',
  duplicate: 'Build it into every component'
};
