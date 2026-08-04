import type { ReactNode } from 'react';
import './Band.css';

export type BandRole = 'base' | 'sunken' | 'inverse' | 'inverse-raised';
export type BandScale = 'compact' | 'default' | 'feature';

export interface BandProps {
  role?: BandRole;
  scale?: BandScale;
  /** Opt out of the 1000px measure — heroes and photography only. */
  bleed?: boolean;
  children?: ReactNode;
}

/**
 * A full-width section that owns the foreground of everything inside it.
 *
 * `data-band` re-declares the semantic custom properties for this subtree, so a
 * component dropped inside an inverse band flips with no override. That is the
 * CSS equivalent of Figma's mode override — except CSS is relative ("the other
 * mode, whatever the page is in") where Figma is absolute. See
 * docs/banding-system.md.
 */
export function Band({ role = 'base', scale = 'default', bleed = false, children }: BandProps) {
  return (
    <section className="band" data-band={role} data-scale={scale}>
      {bleed ? children : <div className="measure">{children}</div>}
    </section>
  );
}
