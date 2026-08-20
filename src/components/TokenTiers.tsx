import { useId, type CSSProperties } from 'react';
import './TokenTiers.css';
import type { TokenSwatch, TokenTier, TokenTierBrand, TokenTierGlyph } from '../data/egds-token-tiers';

/**
 * How many brands the stylesheet can resolve.
 *
 * The picker is CSS, so the rule that says "brand 2 is selected, therefore show
 * value set 2" has to be written out once per index — there is no loop in a
 * stylesheet. Three rules cover the three brands this diagram has. A fourth
 * brand would render, would be selectable, and would resolve NOTHING in the
 * tier above it, which is a picture that looks finished and is lying. So it
 * throws at build time, with the block to extend named in the message: the same
 * choice as the hero refusing a typed count rather than quietly rendering it.
 */
const RESOLVABLE_BRANDS = 3;

export interface TokenTiersBase {
  /** Set in caps by the stylesheet. Type it in sentence case. */
  eyebrow: string;
  name: string;
}

export interface TokenTiersRowLabels {
  /** Names the row every brand repeats unchanged: "Semantic tokens (same)". */
  shared: string;
  /** Names the row that differs: "Feature tokens (per brand)". */
  perBrand: string;
}

export interface TokenTiersProps {
  /**
   * The accessible name for the picture, and REQUIRED for the same reason
   * `IconButton` requires `aria-label`.
   *
   * A picture built out of elements has no `alt` to forget, so it can ship with
   * no text alternative at all and look finished — which is worse than a broken
   * image, because nothing reports it. The stack takes `role="img"` and this
   * string, so assistive technology is handed one description of the picture
   * rather than eighty loose fragments of it in reading order.
   */
  alt: string;
  /** The component every tier below resolves a value for. */
  base: TokenTiersBase;
  /** Foundation, semantic, feature. Rendered in the order given. */
  tiers: TokenTier[];
  /** The line under the stack, stating what the picture argues. */
  note: string;
  brands: TokenTierBrand[];
  /**
   * The semantic row, rendered identically under every brand.
   *
   * One array passed once, not one per brand. The diagram's claim is that these
   * do not vary, and three lists that happen to agree would be that claim
   * maintained by hand.
   */
  sharedSemantic: TokenSwatch[];
  rowLabels: TokenTiersRowLabels;
  /**
   * The group name for the brand picker, announced before the three options.
   *
   * Visually hidden. On screen the three columns are self-evidently a set and
   * the caption says what picking one does; announced, a radio with no group
   * label is an answer with no question in front of it.
   */
  pickerLegend: string;
  /**
   * Which brand is resolved on first paint, by name. None by default.
   *
   * The empty state is the honest one and it is what the static picture showed:
   * the feature tier has nothing in it until a brand puts something there. This
   * exists so a story can snapshot the resolved state, since Chromatic
   * photographs a page rather than clicking through it.
   */
  defaultBrand?: string;
  /**
   * The depicted system's accent, used to wash the tinted tier.
   *
   * Passed down as `--tt-tint` and washed by the stylesheet rather than mixed
   * here, because the hue is data and the strength is not: a dark violet washed
   * straight onto a dark band measures 1.04:1 against it and simply disappears.
   * The stylesheet shifts it toward `fg/primary` first, so the hue stays the
   * depicted one and the lightness follows the theme. Omitting it leaves the
   * middle tier an outline rather than turning it grey.
   */
  tint?: string;
  caption?: string;
  /**
   * `<file>:<path>` into src/copy, making the caption editable in the browser
   * under `npm run dev`. Dev tooling only; inert in a build.
   */
  captionCopyRef?: string;
}

/**
 * Glyphs for the three tiers.
 *
 * Deliberately NOT members of the `Icon` set, and not additions to it. That set
 * is contracted as real Revolut assets taken verbatim from assets.revolut.com,
 * with a Figma component set and a checksum behind it; three invented marks in
 * there would make all three statements false. Same argument, same conclusion,
 * as the service marks on /how-this-was-built living in their own file.
 */
function TierGlyph({ name }: { name: TokenTierGlyph }) {
  return (
    <svg className="token-tiers__glyph" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
      {name === 'layers' && (
        <>
          <path d="M11 2.5 20 7l-9 4.5L2 7Z" />
          <path d="M2 11.4 11 15.9l9-4.5" />
          <path d="M2 15.4 11 19.9l9-4.5" />
        </>
      )}
      {/* Dashed, because a semantic token is a name for a value rather than one. */}
      {name === 'mode' && <circle cx="11" cy="11" r="7.25" strokeDasharray="3 2.4" />}
      {name === 'overlap' && (
        <>
          <circle cx="8" cy="11" r="5.25" />
          <circle cx="14" cy="11" r="5.25" />
        </>
      )}
    </svg>
  );
}

/** One circle. No `hex` renders the empty outline: a slot with nothing in it yet. */
function Swatch({ swatch, size }: { swatch: TokenSwatch; size: 'tier' | 'mini' }) {
  return (
    <li className="token-tiers__swatch" data-size={size}>
      <span
        className="token-tiers__dot"
        data-empty={swatch.hex ? undefined : ''}
        style={swatch.hex ? { background: swatch.hex } : undefined}
      />
      {swatch.label && <span className="token-tiers__swatch-label">{swatch.label}</span>}
      {/* Tabular, so six hexes under six centred dots line up as a row of values
          rather than six differently-ragged strings. */}
      {swatch.value && <span className="token-tiers__swatch-value">{swatch.value}</span>}
    </li>
  );
}

/** One row of six. Several of these stack in the same grid cell and cross-fade. */
function SwatchRow({ swatches, set }: { swatches: TokenSwatch[]; set: string }) {
  return (
    <ul className="token-tiers__swatches token-tiers__value-set" data-set={set}>
      {swatches.map((swatch, i) => (
        <Swatch swatch={swatch} size="tier" key={swatch.label ?? `${set}-${i}`} />
      ))}
    </ul>
  );
}

/**
 * The token architecture of a multi-brand library, as a diagram you can operate:
 * one base component over three tiers of tokens, three brands underneath, and
 * the bottom tier resolving to whichever brand the reader picks.
 *
 * BUILT RATHER THAN EXPORTED, which is the whole reason it exists. The picture
 * shipped first as a 1.3MB PNG on a near-white plate, and on a dark page that is
 * a lit panel in the middle of an article — the case `Media`'s `srcDark` exists
 * for, needing a second export that never landed. Drawn in elements, the chrome
 * takes the page's own tokens and the problem does not arise in either theme, at
 * any width, with nothing to download.
 *
 * IT IS INTERACTIVE AND IT SHIPS NO JAVASCRIPT, which is the part worth copying.
 * The picker is three native radios and the resolution is `:has()` — so it works
 * with scripting off, arrow keys move between brands because that is what a
 * radio group does, and the page stays a prerendered document with no hydration
 * boundary in it. A React island here would have shipped a runtime to re-render
 * a picture that was already correct in the HTML, and put a running component
 * inside every Chromatic snapshot. The rule generalises: reach for state only
 * once the platform has actually run out.
 *
 * The other split it keeps is the one from the still version. Everything the
 * diagram is MADE of — plates, rules, type, connectors — is a token reference,
 * so the component repaints with the brand pack like everything else on the
 * site. Everything the diagram is ABOUT — six greys, six semantic values, three
 * brand ramps — is data, because a picture of somebody else's palette that
 * repaints with yours has stopped being true. Bands are relative; the thing on
 * the wall is not.
 */
export function TokenTiers({
  alt, base, tiers, note, brands, sharedSemantic, rowLabels, pickerLegend,
  defaultBrand, tint, caption, captionCopyRef
}: TokenTiersProps) {
  if (brands.length > RESOLVABLE_BRANDS) {
    throw new Error(
      `TokenTiers: ${brands.length} brands, and the stylesheet resolves ${RESOLVABLE_BRANDS}. ` +
      'Extend the [data-set] block in TokenTiers.css — see RESOLVABLE_BRANDS in TokenTiers.tsx.'
    );
  }

  /*
    One name per instance, so two diagrams on a page cannot deselect each other,
    and one that nothing has to be told. A prop would be a required argument
    whose only job is to be different from the last one.
  */
  const group = useId();

  /*
    Each brand's accent, hoisted onto the root as --tt-accent-0..2, so the CSS
    can hand the SELECTED one to --tt-selected and anything in the diagram can
    read it. Without this the accent is trapped on the column it belongs to, and
    the tier at the top of the stack — the thing actually being resolved — has no
    way to know which brand resolved it.
  */
  const accents = {
    ...Object.fromEntries(brands.map((brand, i) => [`--tt-accent-${i}`, brand.accent])),
    ...(tint ? { '--tt-tint': tint } : {})
  } as CSSProperties;

  return (
    <figure className="token-tiers">
      <div className="token-tiers__diagram" data-tinted={tint ? '' : undefined} style={accents}>
        {/*
          `role="img"` over the STACK, not over the whole diagram, and the move is
          forced rather than tidy. The still version labelled everything, which was
          right when nothing in it was focusable; a radio inside a `role="img"` is
          a control assistive technology has been told is a picture. So the picture
          keeps its one description and the picker sits outside it as a real
          fieldset, which is also the only arrangement where "Expedia, radio
          button, 1 of 3" is ever announced.
        */}
        <div className="token-tiers__stack" role="img" aria-label={alt}>
          <div className="token-tiers__base">
            <span className="token-tiers__eyebrow">{base.eyebrow}</span>
            <span className="token-tiers__base-name">{base.name}</span>
          </div>

          {tiers.map((tier) => (
            <div className="token-tiers__step" key={tier.title}>
              <span className="token-tiers__drop" />
              <div
                className="token-tiers__tier"
                data-weight={tier.weight}
                data-resolves={tier.resolvesPerBrand ? '' : undefined}
                /*
                  Only the depicted plate is inline, because only it is data.
                  The tinted plate's wash moved into the stylesheet, since its
                  STRENGTH and direction have to follow the theme and its hue
                  does not — see --tt-tint-shifted. See TokenTier.plate for why
                  the solid tier takes no token at all: a themed plate turns the
                  loudest tier into a white slab in dark mode, which is the fault
                  this component was built to remove rather than reproduce.
                */
                style={tier.plate ? { background: tier.plate.bg, color: tier.plate.fg } : undefined}
              >
                <div className="token-tiers__tier-label">
                  <TierGlyph name={tier.glyph} />
                  <span className="token-tiers__tier-title">{tier.title}</span>
                  <span className="token-tiers__tier-gloss">{tier.gloss}</span>
                </div>

                {tier.resolvesPerBrand ? (
                  /*
                    Every state rendered, one shown. They are stacked in a single
                    grid cell rather than swapped, which buys two things: the tier
                    cannot change height when a brand is picked, and the change is
                    a cross-fade of opacity rather than a repaint — the empty ring
                    filling in, which is the moment the whole diagram is for.
                  */
                  <div className="token-tiers__values">
                    <SwatchRow swatches={tier.swatches} set="empty" />
                    {brands.map((brand, i) => (
                      <SwatchRow
                        key={brand.name}
                        set={String(i)}
                        swatches={tier.swatches.map((swatch, j) => ({
                          label: swatch.label,
                          hex: brand.feature[j]
                        }))}
                      />
                    ))}
                  </div>
                ) : (
                  <ul className="token-tiers__swatches">
                    {tier.swatches.map((swatch, i) => (
                      <Swatch swatch={swatch} size="tier" key={swatch.label ?? `${tier.title}-${i}`} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          <p className="token-tiers__note">{note}</p>
          {/*
            The bracket fanning the stack out to three columns. Hidden below the
            breakpoint where the columns stack, because a bracket over a single
            column is a line pointing at nothing.
          */}
          <span className="token-tiers__fan" />
        </div>

        <fieldset className="token-tiers__picker">
          <legend className="token-tiers__legend">{pickerLegend}</legend>
          <ul className="token-tiers__brands">
            {brands.map((brand, i) => (
              <li
                className="token-tiers__brand"
                data-index={i}
                key={brand.name}
                style={{ '--tt-accent': brand.accent } as CSSProperties}
              >
                {/*
                  Native radios, not buttons with `aria-pressed`. One `name`
                  gives the group arrow-key navigation, a roving tab stop and
                  "1 of 3" for free, and — the part that matters here — it all
                  still works with scripting off, because the browser is the
                  thing implementing it.
                */}
                <input
                  className="token-tiers__radio"
                  type="radio"
                  name={group}
                  id={`${group}-${i}`}
                  defaultChecked={brand.name === defaultBrand}
                />
                <div className="token-tiers__brand-head">
                  {/*
                    Empty alt and aria-hidden: the label beside it already names
                    the brand, and a mark that repeats it announces everything
                    twice. It is decoration in the accessibility sense and the
                    whole point of the column visually, which is the ordinary
                    case for a logo next to its own name.
                  */}
                  <img className="token-tiers__brand-mark" src={brand.mark} alt="" aria-hidden="true" />
                  {/*
                    The label holds the brand name and nothing else, because a
                    `label` takes phrasing content and a `ul` is not that. The
                    whole column is still the target: the label's own pseudo
                    element is stretched over it, the same trick a case-study
                    tile uses to make a card click through its title.
                  */}
                  <label className="token-tiers__brand-name" htmlFor={`${group}-${i}`}>
                    {brand.name}
                  </label>
                </div>

                {/*
                  Hidden from assistive technology, all of it. The stack above
                  already describes these rows in one sentence, and read out they
                  are thirty-six list items with no names. What is left announced
                  is the choice itself, which is the only part a reader can act on.
                */}
                <div className="token-tiers__brand-row" aria-hidden="true">
                  <span className="token-tiers__brand-label">{rowLabels.shared}</span>
                  <ul className="token-tiers__swatches" data-row="mini">
                    {sharedSemantic.map((swatch, i2) => (
                      <Swatch swatch={{ hex: swatch.hex }} size="mini" key={`${brand.name}-s${i2}`} />
                    ))}
                  </ul>
                </div>

                <div className="token-tiers__brand-row" aria-hidden="true">
                  <span className="token-tiers__brand-label">{rowLabels.perBrand}</span>
                  <ul className="token-tiers__swatches" data-row="mini">
                    {brand.feature.map((hex, i2) => (
                      <Swatch swatch={{ hex }} size="mini" key={`${brand.name}-f${i2}`} />
                    ))}
                  </ul>
                </div>

                {/*
                  A span, never a button. This is a picture of a control, and a
                  real one here would be a second tab stop inside a column that
                  already has one, announcing a label that does nothing. The
                  thing you can actually operate is the radio.
                */}
                <span
                  className="token-tiers__button"
                  style={{ background: brand.button.bg, color: brand.button.fg }}
                  aria-hidden="true"
                >
                  {base.name}
                </span>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
      {caption && (
        <figcaption className="token-tiers__caption" data-copy={captionCopyRef}>{caption}</figcaption>
      )}
    </figure>
  );
}
