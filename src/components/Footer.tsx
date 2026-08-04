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
}

/**
 * Transparent by design — the band it sits in owns the surface, so the footer
 * inherits foreground with no override. Setting a fill would break the inverse
 * case.
 */
export function Footer({
  scale = 'full',
  columns,
  link = { label: 'How this was built', href: '/how-this-was-built' }
}: FooterProps) {
  return (
    <footer className="footer" data-scale={scale}>
      <div className="measure footer__inner">
        {scale === 'full' && (
          <>
            <div className="footer__top">
              <Logo height={24} />
              <div className="footer__columns">{columns}</div>
            </div>
            <hr className="footer__rule" />
          </>
        )}
        <div className="footer__bottom">
          {scale === 'compact' && <Logo height={20} />}
          <p className="footer__copy">© {new Date().getFullYear()} Rohit Sehmi</p>
          <ArrowLink href={link.href}>{link.label}</ArrowLink>
        </div>
      </div>
    </footer>
  );
}
