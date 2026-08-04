import { useEffect, useState, type ReactNode } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { IconButton } from './IconButton';
import './Nav.css';

export interface NavProps {
  links?: { label: string; href: string; current?: boolean }[];
  actions?: ReactNode;
  /** top is transparent and sits over the band; scrolled takes the canvas. */
  state?: 'top' | 'scrolled';
  /**
   * Code-only prop, with no Figma counterpart: sticking is a scroll behaviour
   * and Figma has no scroll position. When set, the nav pins to the top and
   * drives its own state, so `state` becomes the value before the first scroll.
   */
  sticky?: boolean;
  /**
   * Set when the nav floats over a full-bleed image before it scrolls.
   *
   * At `state=top` the nav is transparent, so it needs the foreground of what
   * is beneath it. It sits outside the band stack and cannot inherit that, so
   * over a dark hero it would otherwise render dark text on a dark image.
   *
   * Absolute rather than a band role, for the same reason the hero itself is:
   * a photograph is dark in both themes, so a relative role would send the nav
   * the wrong way in one of them.
   *
   * Dropped the moment it scrolls, because a scrolled nav takes bg/canvas and
   * needs the page's own foreground again.
   */
  onMedia?: boolean;
}

/**
 * `state=top` is transparent on purpose — it sits over whatever band is beneath
 * it and inherits that band's foreground for free. `state=scrolled` takes
 * bg/canvas plus a 1px hairline. Never a shadow: revolut.com has zero
 * box-shadow, and the colour step is the divider.
 *
 * Nav links are ghost buttons — real hit area, real press feedback.
 */
export function Nav({ links = [], actions, state = 'top', sticky = false, onMedia = false }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    // Threshold rather than zero: at exactly 0 a rubber-band scroll on iOS
    // flickers the background on and off.
    const read = () => setScrolled(window.scrollY > 8);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [sticky]);

  const resolved = sticky ? (scrolled ? 'scrolled' : 'top') : state;

  return (
    <header
      className="nav"
      data-state={resolved}
      data-sticky={sticky ? 'true' : undefined}
      data-on-media={onMedia && resolved === 'top' ? 'true' : undefined}
    >
      <div className="measure nav__inner">
        <a className="nav__logo" href="/" aria-label="Home"><Logo height={32} /></a>
        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <Button key={l.href} variant="ghost" size="sm" href={l.href} aria-current={l.current ? 'page' : undefined}>
              {l.label}
            </Button>
          ))}
        </nav>
        <div className="nav__actions">{actions}</div>
        <div className="nav__menu">
          <IconButton icon="menu" variant="ghost" size="sm" aria-label="Open menu" />
        </div>
      </div>
    </header>
  );
}
