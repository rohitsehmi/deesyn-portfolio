import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { ArrowLink } from './Link';
import './Footer.css';

export interface FooterProps {
  scale?: 'compact' | 'full';
  columns?: ReactNode;
  /**
   * The single link in the footer bottom row.
   *
   * It is not a contact address. Contact already has a nav item, so a mailto
   * here would be a second affordance for an intent that is already served,
   * and the footer's one link is worth more pointing somewhere the reader
   * cannot get to otherwise.
   */
  link?: { label: string; href: string };
  /**
   * The path currently being rendered, so the footer can avoid linking to it.
   *
   * Same rule the nav states and `nextStudy()` enforces: a link pointing at the
   * page you are already on is a wasted slot. Handled here rather than by
   * passing a different `link` from the one page that needs it, because the
   * next page added to the footer would hit it again and nothing would say so.
   *
   * Optional: omitted, the footer just renders its link, which is right for
   * Storybook and for anywhere with no routing.
   */
  currentPath?: string;
}

/** Offered instead of a self-link. The home page is the two case studies. */
const FALLBACK_LINK = { label: 'Back to the work', href: '/' };

/**
 * Transparent by design — the band it sits in owns the surface, so the footer
 * inherits foreground with no override. Setting a fill would break the inverse
 * case.
 */
export function Footer({
  scale = 'full',
  columns,
  link = { label: 'How this was built', href: '/how-this-was-built' },
  currentPath
}: FooterProps) {
  /*
    Trailing slashes are normalised because Astro serves /how-this-was-built/
    while the href is written without one. Comparing them raw would silently
    never match, and the bug would look exactly like no fix at all.
  */
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  const resolved =
    currentPath && norm(currentPath) === norm(link.href) ? FALLBACK_LINK : link;

  /*
    The copyright sits under the mark, not beside it, so the two read as one
    block of attribution rather than as two separate items in a row. Written
    once and placed in whichever row carries the logo: top at full scale,
    bottom at compact.
  */
  const brand = (
    <div className="footer__brand">
      <Logo height={32} />
      <p className="footer__copy">© {new Date().getFullYear()} Rohit Sehmi</p>
    </div>
  );

  return (
    <footer className="footer" data-scale={scale}>
      <div className="measure footer__inner">
        {scale === 'full' && (
          <>
            <div className="footer__top">
              {brand}
              <div className="footer__columns">{columns}</div>
            </div>
            <hr className="footer__rule" />
          </>
        )}
        <div className="footer__bottom">
          {scale === 'compact' && brand}
          <ArrowLink href={resolved.href}>{resolved.label}</ArrowLink>
        </div>
      </div>
    </footer>
  );
}
