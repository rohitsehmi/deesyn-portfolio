import './Logo.css';
import { MARK_PATHS, LOCKUP_PATHS, MARK_VIEWBOX, LOCKUP_VIEWBOX, WISE_WORDMARK, type BrandPath } from './logo-paths';

export interface LogoProps {
  /**
   * `wordmark` is the Ro x Revolut lockup, 233x48. `mark` is the disc alone,
   * 48x48.
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
 * `fill: currentColor` is the equivalent of Revolut's
 * `var(--rui-color-foreground)` — the artwork takes the colour of whatever it
 * sits in, so it goes white on an inverse band with no override. Never
 * recolour it.
 *
 * The lockup is a statement of what this site is: work made for Revolut, not
 * work by Revolut. It resolves the question the old version raised, which was
 * that presenting Revolut's wordmark alone made their identity read as the
 * site's own.
 *
 * One thing to settle before this is published anywhere open: an `x` lockup
 * conventionally reads as a partnership. Sent to Revolut as an application it
 * says exactly the right thing; on a public URL it could imply an engagement
 * that does not exist.
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

    Only the last path differs. The first four — disc, script, `x` — are shared,
    so this costs one 1.4kB path rather than a second lockup.

    `data-brand-only` is what the stylesheet keys off. With no `data-brand` on
    the root, the Revolut logotype shows, which is the correct default for
    www.deesyn.com and for any client that runs no JavaScript at all.
  */
  const isLockup = variant === 'wordmark';
  return (
    <svg
      className="logo"
      viewBox={viewBox}
      height={height}
      width={Math.round(height * ratio)}
      fill="currentColor"
      role="img"
      aria-label={title}
      focusable="false"
    >
      {paths.map((p, i) => (
        <path
          key={p.d.slice(0, 24)}
          d={p.d}
          {...(isLockup && i === paths.length - 1 ? { 'data-brand-only': 'revolut' } : {})}
          {...(p.evenOdd ? { fillRule: 'evenodd' as const, clipRule: 'evenodd' as const } : {})}
        />
      ))}
      {isLockup && <path d={WISE_WORDMARK.d} data-brand-only="wise" />}
    </svg>
  );
}
