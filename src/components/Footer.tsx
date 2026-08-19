import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { footerLinks, NEW_TAB, type FooterLink } from '../data/nav';
import { ArrowLink } from './Link';
import './Footer.css';

export interface FooterProps {
  scale?: 'compact' | 'full';
  columns?: ReactNode;
  /**
   * The links in the footer's bottom row. Defaults to `footerLinks`.
   *
   * The bar for adding one lives in `nav.ts`, next to the list itself rather
   * than only here, so it is stated where a link would actually be added: it
   * has to point somewhere the reader cannot get to otherwise, which is why a
   * mailto is not among them while Contact has a nav item.
   */
  links?: FooterLink[];
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
const FALLBACK_LINK: FooterLink = { label: 'Back to the work', href: '/' };

/**
 * Transparent by design — the band it sits in owns the surface, so the footer
 * inherits foreground with no override. Setting a fill would break the inverse
 * case.
 */
export function Footer({
  scale = 'full',
  columns,
  links = footerLinks,
  currentPath
}: FooterProps) {
  /*
    Trailing slashes are normalised because Astro serves /how-this-was-built/
    while the href is written without one. Comparing them raw would silently
    never match, and the bug would look exactly like no fix at all.
  */
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  /*
    Only an internal link can be the page you are on, so an external one is
    never swapped — and the fallback is offered once, for whichever entry
    matched, rather than repeated.
  */
  const resolved = links.map((l) =>
    !l.external && currentPath && norm(currentPath) === norm(l.href) ? FALLBACK_LINK : l
  );

  /*
    The copyright sits under the mark, not beside it, so the two read as one
    block of attribution rather than as two separate items in a row. Written
    once and placed in whichever row carries the logo: top at full scale,
    bottom at compact.
  */
  const brand = (
    <div className="footer__brand">
      <Logo variant="wordmark" height={32} />
      <p className="footer__copy">© {new Date().getFullYear()} Rohit Sehmi</p>
    </div>
  );

  return (
    <footer className="footer" role="contentinfo" data-scale={scale}>
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
          {/*
            The links are wrapped rather than sitting directly in the row, and
            that is load-bearing rather than tidy. `.footer__bottom` is
            column-reverse below 768px, which put the link above the mark; that
            was safe only while the row had exactly ONE tab stop, because
            .footer__brand holds nothing focusable. A second link in a reversed
            container would be a real focus-order trap — the lower link taking
            focus first. The wrapper is not reversed, so the links keep their
            order relative to each other while the group still sits above the
            mark.
          */}
          <div className="footer__links">
            {resolved.map((l) => (
              <ArrowLink
                key={l.href}
                href={l.href}
                {...(l.external
                  ? {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      'aria-label': `${l.label}, ${NEW_TAB}`
                    }
                  : {})}
              >
                {l.label}
              </ArrowLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
