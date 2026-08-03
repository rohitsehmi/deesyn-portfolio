import type { ReactNode } from 'react';
import './Card.css';

export interface CardProps {
  variant?: 'base' | 'sunken';
  /** Slots. The card owns shape and surface; it does not own what goes in it. */
  media?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  href?: string;
}

/**
 * Padding sits on the body, not the card, so media bleeds to the edge while
 * content stays inset — the same structure as the Figma component, where those
 * are three slots.
 *
 * Never nest cards. If content inside needs its own container, the card is
 * doing too much.
 */
export function Card({ variant = 'base', media, children, actions, href }: CardProps) {
  const inner = (
    <>
      {media && <div className="card__media">{media}</div>}
      <div className="card__body">
        {children}
        {actions && <div className="card__actions">{actions}</div>}
      </div>
    </>
  );
  return href
    ? <a className="card" data-variant={variant} data-interactive="true" href={href}>{inner}</a>
    : <div className="card" data-variant={variant}>{inner}</div>;
}
