import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { IconButton } from './IconButton';
import './Nav.css';

export interface NavProps {
  links?: { label: string; href: string; current?: boolean }[];
  actions?: ReactNode;
  /** top is transparent and sits over the band; scrolled takes the canvas. */
  state?: 'top' | 'scrolled';
}

/**
 * `state=top` is transparent on purpose — it sits over whatever band is beneath
 * it and inherits that band's foreground for free. `state=scrolled` takes
 * bg/canvas plus a 1px hairline. Never a shadow: revolut.com has zero
 * box-shadow, and the colour step is the divider.
 *
 * Nav links are ghost buttons — real hit area, real press feedback.
 */
export function Nav({ links = [], actions, state = 'top' }: NavProps) {
  return (
    <header className="nav" data-state={state}>
      <div className="nav__inner">
        <a className="nav__logo" href="/" aria-label="Home"><Logo height={22} /></a>
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
