import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { ArrowLink } from './Link';
import './Footer.css';

export interface FooterProps { scale?: 'compact' | 'full'; columns?: ReactNode; email?: string; }

/**
 * Transparent by design — the band it sits in owns the surface, so the footer
 * inherits foreground with no override. Setting a fill would break the inverse
 * case.
 *
 * Contact is a mailto, not a form: no backend to run, and a portfolio form
 * converts worse than an address you can copy.
 */
export function Footer({ scale = 'full', columns, email = 'rohit.sehmi@gmail.com' }: FooterProps) {
  return (
    <footer className="footer" data-scale={scale}>
      <div className="footer__inner">
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
          <ArrowLink href={`mailto:${email}`}>{email}</ArrowLink>
        </div>
      </div>
    </footer>
  );
}
