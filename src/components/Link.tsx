import type { AnchorHTMLAttributes } from 'react';
import { Icon } from './Icon';
import './Link.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> { children: React.ReactNode; }

/**
 * Inline prose link. Underlined — an unstyled link inside body copy is an
 * accessibility failure, not a style choice.
 *
 * Separate from ArrowLink for the same reason they are separate components in
 * Figma: one is prose, one is a call to action.
 */
export function Link({ children, ...rest }: LinkProps) {
  return <a className="link" {...rest}>{children}</a>;
}

/**
 * Standalone call to action. Never underlined; the arrow carries the
 * affordance, and translates 4px on hover — the motion Figma documented but
 * could not draw.
 */
export function ArrowLink({ children, ...rest }: LinkProps) {
  return (
    <a className="arrow-link" {...rest}>
      <span>{children}</span>
      <span className="arrow-link__icon"><Icon name="arrow-thin-right" size={20} /></span>
    </a>
  );
}
