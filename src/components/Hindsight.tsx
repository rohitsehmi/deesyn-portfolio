import type { ReactNode } from 'react';
import './Hindsight.css';

export interface HindsightProps {
  /** Override only if the project needs a more specific framing. */
  title?: string;
  /**
   * The callout carries its own heading, so it is its section's header by
   * default. Pair it with a SectionHeading saying the same thing and the page
   * states the point twice.
   */
  level?: 2 | 3;
  children?: ReactNode;
}

/**
 * What you would change if you ran the project again.
 *
 * Named on a reader as something the team actively looks for, and cheap to
 * write, which makes leaving it out the expensive choice. It reads as
 * self-awareness only when it names a real cost. "More user testing" is the
 * answer everyone gives and scores nothing.
 */
export function Hindsight({ title = 'What I would change', level = 2, children }: HindsightProps) {
  const H = level === 3 ? 'h3' : 'h2';
  return (
    <aside className="hindsight">
      <H className="hindsight__title">{title}</H>
      <div className="hindsight__body">{children}</div>
    </aside>
  );
}
