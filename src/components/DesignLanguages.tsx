import { useId } from 'react';
import './DesignLanguages.css';
import type { DesignLanguage, SharedRamp } from '../data/egds-design-languages';

export interface DesignLanguagesLedger {
  shared: number;
  differs: number;
  partial: number;
  union: number;
  invariant: string;
}

export interface DesignLanguagesLabels {
  identity: string;
  surface: string;
  display: string;
  headlines: string;
  own: string;
  shared: string;
  /** The checkbox label, and the only instruction on the figure. */
  duplicate: string;
}

export interface DesignLanguagesProps {
  /**
   * The accessible name for the whole figure, and REQUIRED for the same reason
   * the other diagrams require one: a picture built from elements has no missing
   * image for anyone to notice.
   *
   * It carries the counts, because the argument here is an amount — how much of
   * four design languages turns out to be one design language.
   */
  alt: string;
  /** The brands, left to right. */
  languages: DesignLanguage[];
  /** The ramps every brand declares identically. The mass of the picture. */
  shared: SharedRamp[];
  /** Computed in the data file from the variable dumps, never typed. */
  ledger: DesignLanguagesLedger;
  labels: DesignLanguagesLabels;
  /**
   * Start with the shared set duplicated into every brand. Off by default,
   * because what shipped is the honest resting state.
   *
   * It exists so a story can snapshot the second state, since Chromatic
   * photographs a page rather than operating one.
   */
  defaultDuplicated?: boolean;
  caption?: string;
  captionCopyRef?: string;
}

/**
 * One ramp of ten. `title` carries the value so a reader can check a swatch
 * against the brand's own site, which is the only verification a picture of
 * somebody else's palette can offer.
 */
function Ramp({ ramp }: { ramp: SharedRamp }) {
  return (
    <div className="design-languages__ramp">
      <span className="design-languages__ramp-label">{ramp.label}</span>
      <span className="design-languages__ramp-steps">
        {ramp.steps.map((step) => (
          <span
            key={step}
            className="design-languages__step"
            style={{ background: step }}
            title={step}
          />
        ))}
      </span>
    </div>
  );
}

function SharedSet({ shared }: { shared: SharedRamp[] }) {
  return (
    <div className="design-languages__ramps">
      {shared.map((ramp) => <Ramp key={ramp.label} ramp={ramp} />)}
    </div>
  );
}

/**
 * What four design languages actually amounted to, measured out of the real
 * foundation files rather than remembered.
 *
 * IT ILLUSTRATES A REJECTED EXPLORATION, which decides its shape. The reader has
 * just been told the original plan built each brand's identity into the
 * components themselves, and that it proved far more complex than the early
 * assessment suggested. This is why: a brand's identity is a handful of values
 * and a typeface, sitting on top of a foundation the brands declare identically,
 * so building the identity in meant carrying a copy of the shared part per
 * brand. The control does exactly that and the duplication is the cost.
 *
 * THE VALUES ARE SOURCED AND THEREFORE ABSOLUTE. They are Expedia's, Hotels.com's
 * and Vrbo's own, read from the live Figma file — so, like the token-tiers figure
 * next door, they must survive a theme change unmoved. Everything the diagram is
 * MADE of is a token and everything it is ABOUT is data; a picture of somebody
 * else's palette that repaints with yours has stopped being true.
 *
 * Interactive with no JavaScript, on the same mechanism as the other three: one
 * native checkbox and `:has()`.
 */
export function DesignLanguages({
  alt, languages, shared, ledger, labels, defaultDuplicated, caption, captionCopyRef
}: DesignLanguagesProps) {
  const id = useId();

  return (
    <figure className="design-languages">
      <div className="design-languages__figure">
        <div className="design-languages__control">
          {/*
            A real checkbox, visually replaced rather than hidden: it keeps the
            space bar, the focus ring and the announced state, none of which a
            div with an onClick would have had.
          */}
          <input
            className="design-languages__toggle"
            type="checkbox"
            id={id}
            defaultChecked={defaultDuplicated}
          />
          <label className="design-languages__toggle-label" htmlFor={id}>{labels.duplicate}</label>
        </div>

        {/* `role="img"` over the picture, never over the control. */}
        <div className="design-languages__plate" role="img" aria-label={alt}>
          <ol className="design-languages__brands">
            {languages.map((language) => (
              <li className="design-languages__brand" key={language.name}>
                <span className="design-languages__name">{language.name}</span>

                <ul className="design-languages__own">
                  <li className="design-languages__own-row">
                    <span className="design-languages__swatch" style={{ background: language.identity }} />
                    <span className="design-languages__own-label">{labels.identity}</span>
                    <span className="design-languages__value">{language.identity}</span>
                  </li>
                  <li className="design-languages__own-row">
                    <span className="design-languages__swatch" style={{ background: language.surface }} />
                    <span className="design-languages__own-label">{labels.surface}</span>
                    <span className="design-languages__value">{language.surface}</span>
                  </li>
                  {/* Named, never set. The real faces are licensed and absent, and a
                      substitute would show a face EGDS does not ship. */}
                  <li className="design-languages__own-row" data-kind="face">
                    <span className="design-languages__own-label">{labels.display}</span>
                    <span className="design-languages__face">{language.display}</span>
                  </li>
                  {/*
                    A ROW OF ITS OWN, not a second line inside the face cell. The
                    face column is `auto`, so a note living in it sizes the column
                    to the note's own width and squeezes the label beside it —
                    which is how "Display face" came out broken across two lines
                    on the one brand that has a note.
                  */}
                  {language.displayLeadsHeadlines && (
                    <li className="design-languages__own-row" data-kind="note">
                      <span className="design-languages__face-note">{labels.headlines}</span>
                    </li>
                  )}
                </ul>

                {/*
                  The copy of the shared set that the control turns on. Rendered
                  always and revealed by CSS, so the figure needs no script, and
                  `aria-hidden` because the alt already states the count and three
                  identical ramps read aloud three times is noise rather than
                  information.
                */}
                <div className="design-languages__copy" aria-hidden="true">
                  <SharedSet shared={shared} />
                </div>
              </li>
            ))}
          </ol>

          <div className="design-languages__shared">
            <p className="design-languages__shared-label">
              <strong>{labels.shared}</strong>
              {` — ${ledger.shared} values declared identically by all three. Only ${ledger.differs} differ. ${ledger.invariant}`}
            </p>
            <SharedSet shared={shared} />
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="design-languages__caption" data-copy={captionCopyRef}>{caption}</figcaption>
      )}
    </figure>
  );
}
