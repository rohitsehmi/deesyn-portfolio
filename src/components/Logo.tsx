import './Logo.css';
import { MARK_PATHS, LOCKUP_PATHS, MARK_VIEWBOX, LOCKUP_VIEWBOX, type BrandPath } from './logo-paths';

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
export function Logo({ variant = 'wordmark', height = 24, title = 'Rohit Sehmi for Revolut' }: LogoProps) {
  const { paths, viewBox, ratio } = SHAPES[variant];
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
      {paths.map((p) => (
        <path
          key={p.d.slice(0, 24)}
          d={p.d}
          {...(p.evenOdd ? { fillRule: 'evenodd' as const, clipRule: 'evenodd' as const } : {})}
        />
      ))}
    </svg>
  );
}
