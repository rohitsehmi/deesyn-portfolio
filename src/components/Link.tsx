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
export interface ArrowLinkProps extends LinkProps {
  /**
   * `arrow-thin-right` for somewhere else on this site, `arrow-up-right` for
   * somewhere off it. The diagonal is the long-standing convention for leaving,
   * and it is the reason that icon exists in the set at all — Revolut ships no
   * diagonal arrow, so it is their thin arrow rotated.
   *
   * The hover translate follows the direction the glyph points, so the two
   * cannot disagree.
   */
  icon?: 'arrow-thin-right' | 'arrow-up-right';
  /**
   * `<file>:<path>` into src/copy, making the label editable in the browser
   * while the dev server is running. Dev tooling only — it renders as a plain
   * data attribute and does nothing in a production build.
   *
   * It lands on the label span rather than the anchor because the anchor also
   * contains the icon, and an editable region that swallows an SVG is one
   * backspace away from deleting it.
   */
  copyRef?: string;
}

export function ArrowLink({ children, icon = 'arrow-thin-right', copyRef, ...rest }: ArrowLinkProps) {
  return (
    <a className="arrow-link" data-icon={icon} {...rest}>
      <span data-copy={copyRef}>{children}</span>
      <span className="arrow-link__icon"><Icon name={icon} size={20} /></span>
    </a>
  );
}
