import type { ReactNode } from 'react';
import './Prose.css';

export interface ProseProps {
  /** `narrow` caps at 62ch for dense argument, `default` at 68ch. */
  measure?: 'default' | 'narrow';
  /** Raises size and weight for a single opening paragraph. */
  lead?: boolean;
  children?: ReactNode;
}

/**
 * The running text of a case study. Owns measure and vertical rhythm so no
 * page has to restate them, and so line length stays inside 65-75ch where
 * reading speed holds up.
 */
export function Prose({ measure = 'default', lead = false, children }: ProseProps) {
  return (
    <div className="prose" data-measure={measure} data-lead={lead ? 'true' : undefined}>
      {children}
    </div>
  );
}
