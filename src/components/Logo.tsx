import './Logo.css';
import { MARK_PATHS, LOCKUP_PATHS, MARK_VIEWBOX, LOCKUP_VIEWBOX, PARTNER_WORDMARKS, X_GLYPH, type BrandPath } from './logo-paths';
import { PARTNER_BRANDS } from '../data/brands';

/*
  The brands the `x` belongs to, as one whitespace-separated attribute value.

  Derived from BRANDS rather than typed, so a sixth brand cannot arrive to find
  the glyph hidden on its own hostname — which is the failure the hero copy and
  the index grid have both already had in their own form.
*/
const PARTNER_LIST = PARTNER_BRANDS.join(' ');

export interface LogoProps {
  /**
   * `wordmark` is the lockup, 233x48: the disc, an `x`, and whichever partner
   * logotype the hostname calls for. `mark` is the disc alone, 48x48.
   *
   * ON THE DEFAULT BRAND THE TWO RENDER THE SAME THING, which is not a bug and
   * is why the lockup is still what Nav and Footer ask for. That brand has no
   * partner, so its `x` and every logotype are gated away and the CSS narrows
   * the viewport to the disc — see Logo.css. Asking for the lockup keeps one
   * element in the markup on every host rather than two swapped by CSS, and so
   * keeps one copy of the 6.5kB disc in the HTML.
   *
   * The names are kept from the Figma component set so the two do not diverge,
   * though `lockup` would now be the more accurate word for the first. Rename
   * in Figma first if it is worth changing.
   */
  variant?: 'wordmark' | 'mark';
  height?: number;
  title?: string;
}

const SHAPES: Record<'wordmark' | 'mark', { paths: BrandPath[]; viewBox: string; ratio: number }> = {
  wordmark: { paths: LOCKUP_PATHS, viewBox: LOCKUP_VIEWBOX, ratio: 233 / 48 },
  mark: { paths: MARK_PATHS, viewBox: MARK_VIEWBOX, ratio: 1 }
};

/**
 * `fill: currentColor` — the artwork takes the colour of whatever it sits in,
 * so it goes white on an inverse band with no override. Never recolour it.
 *
 * THE LOCKUP IS NOW A PER-HOSTNAME STATEMENT RATHER THAN THE SITE'S IDENTITY,
 * settled 2026-08-26. An `x` lockup conventionally reads as a partnership,
 * which is exactly right on a subdomain sent to a named person and wrong on
 * the open apex, where it implies an engagement that does not exist. The
 * standing question was whether to keep it at all; the answer is that it
 * belongs where it was aimed and nowhere else.
 *
 * So the default brand renders the disc alone and carries no company's mark in
 * its chrome, and each partner hostname renders the lockup it was made for.
 * The question is not closed by removing the lockup, it is closed by scoping
 * it — one hostname, one reader, one claim.
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
  const { paths, viewBox, ratio } = SHAPES[variant];
  /*
    The lockup ships both logotypes and lets CSS choose, for the same reason
    Media renders both images of a theme pair: the site is prerendered to static
    HTML, so which brand a page belongs to cannot be known at build time when
    one build answers on several hostnames.

    Only the logotype differs. The disc and the script are shared, so this
    costs one path per brand rather than a second lockup each.

    `data-brand-only` is what the stylesheet keys off. With no `data-brand` on
    the root NOTHING here matches, so no logotype and no `x` render at all,
    and the disc is left alone — which is the correct default for
    www.deesyn.com, for the apex, for an unrecognised subdomain and for any
    client that runs no JavaScript at all. That the fallback is the quietest
    of the five outcomes rather than a named company's is the whole point of
    the change; it used to be Revolut's.
  */
  const isLockup = variant === 'wordmark';
  return (
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
      {paths.map((p) => (
        <path
          key={p.d.slice(0, 24)}
          d={p.d}
          {...(isLockup && p === X_GLYPH ? { 'data-brand-only': PARTNER_LIST } : {})}
          {...(p.evenOdd ? { fillRule: 'evenodd' as const, clipRule: 'evenodd' as const } : {})}
        />
      ))}
      {/*
        The fill rule has to be carried here too, and it was not until Asos
        arrived. Wise and Healf are both non-zero, so the omission was
        invisible for as long as they were the only partners; Asos is one
        evenodd path whose counters are cut out of it, and without the rule
        every a, o and s fills in solid. Same spread as the shared paths
        above, deliberately — a second way of writing the same thing is how
        the two diverged in the first place.
      */}
      {isLockup &&
        Object.entries(PARTNER_WORDMARKS).map(([brand, p]) => (
          <path
            key={brand}
            d={p.d}
            data-brand-only={brand}
            {...(p.evenOdd ? { fillRule: 'evenodd' as const, clipRule: 'evenodd' as const } : {})}
          />
        ))}
    </svg>
  );
}
