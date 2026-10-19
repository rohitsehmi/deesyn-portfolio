import './Logo.css';
import { MARK_PATHS, MARK_VIEWBOX, LOCKUP_VIEWBOX, X_GLYPH } from './logo-paths';

export interface LogoProps {
  /**
   * `wordmark` is the lockup: the disc, then the × and the word deesyn beside
   * it. `mark` is the disc alone. Nav and Footer ask for the lockup. The
   * partner logotypes were removed on 2026-10-19.
   *
   * The names are kept from the Figma component set so the two do not diverge,
   * though `lockup` would now be the more accurate word for the first. Rename
   * in Figma first if it is worth changing.
   */
  variant?: 'wordmark' | 'mark';
  height?: number;
  title?: string;
}

const SHAPES: Record<'wordmark' | 'mark', { viewBox: string; ratio: number }> = {
  wordmark: { viewBox: LOCKUP_VIEWBOX, ratio: 233 / 48 },
  mark: { viewBox: MARK_VIEWBOX, ratio: 1 }
};

function MarkGeometry() {
  return (
    <>
      {MARK_PATHS.map((path) => (
        <path
          key={path.d.slice(0, 24)}
          d={path.d}
          {...(path.evenOdd ? { fillRule: 'evenodd' as const, clipRule: 'evenodd' as const } : {})}
        />
      ))}
    </>
  );
}

/**
 * `fill: currentColor` — the artwork takes the colour of whatever it sits in,
 * so it goes white on an inverse band with no override. Never recolour it.
 *
 * The apex lockup is the Ro mark, the same multiplication sign, and the word
 * deesyn. The sign is the published glyph, drawn beside the disc rather than
 * inside the clipped viewport, so the partner logotypes stay out of that window.
 * A partner hostname hides the sign and the word, and shows its own logotype
 * in the lockup, which already carries the sign.
 */
/*
  The default accessible name is brand-neutral, and has to be: it is baked into
  the HTML at build time, while which brand a hostname shows is decided at
  runtime, so any company named here would be wrong on every other hostname.

  Nothing is lost. In the nav the anchor around this already carries
  aria-label="Home", which is what a screen reader announces; this name only
  surfaces where the mark stands alone. "Rohit Sehmi" is true on every host.
*/
export function Logo({ variant = 'wordmark', height = 24, title = 'Rohit Sehmi' }: LogoProps) {
  const { viewBox, ratio } = SHAPES[variant];
  /*
    The lockup ships both logotypes and lets CSS choose, for the same reason
    Media renders both images of a theme pair: the site is prerendered to static
    HTML, so which brand a page belongs to cannot be known at build time when
    one build answers on several hostnames.

    Only the logotype differs. The disc and the script are shared, so this
    costs one path per brand rather than a second lockup each.

    `data-brand-only` is what the stylesheet keys off. With no `data-brand` on
    the root no partner logotype matches, and the sign inside this svg stays
    hidden. The apex draws that same glyph beside the disc, and a partner
    hostname hides it along with the word.
  */
  const isLockup = variant === 'wordmark';
  return (
    <span className={isLockup ? 'logo-brand logo-brand--lockup' : 'logo-brand'}>
    <svg
      className={isLockup ? 'logo logo--lockup' : 'logo'}
      viewBox={viewBox}
      /*
        xMin, and slice rather than the default meet, because the default
        brand's copy of this element is a 233-wide viewBox shown in a square
        viewport. `meet` would fit the whole box inside it and render a lockup
        6.6px tall; `slice` scales to cover and clips from the left edge, which
        lands exactly on the disc at x 0..48.

        It is a no-op on every partner hostname, where the viewport and the
        viewBox have the same ratio and there is nothing to clip. Left on
        unconditionally rather than switched, since an attribute cannot vary by
        brand in a prerendered build — which is the same constraint that puts
        the logotypes in CSS.
      */
      preserveAspectRatio={isLockup ? 'xMinYMid slice' : 'xMidYMid meet'}
      height={height}
      /*
        NOT ROUNDED, and that is a consequence of the slice above rather than
        fussiness. `slice` scales the viewBox to COVER the viewport and clips
        the overflow, so any disagreement between the two ratios is thrown away
        rather than letter-boxed. Rounding 32 x 233/48 to 155 made the viewport
        155/32 against a viewBox of 233/48 and cost 0.33px off the right edge —
        harmless on Wise, which stops at 219.51 of 233 and has trailing space to
        lose, and NOT harmless on Ticketmaster, whose wordmark is width-bound
        and runs to the very edge of the box.

        A tidier attribute is not worth a logo that is quietly a third of a
        pixel short on one brand. Three decimals puts the residual clip at four
        ten-thousandths of a pixel.
      */
      width={Number((height * ratio).toFixed(3))}
      fill="currentColor"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <MarkGeometry />
    </svg>
    {isLockup && (
      <svg
        className="logo-brand__x"
        viewBox="59.5 16.5 13 13"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
      >
        <path d={X_GLYPH.d} />
      </svg>
    )}
    {isLockup && <span className="logo-brand__word" aria-hidden="true">deesyn</span>}
    </span>
  );
}
