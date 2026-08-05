import type { ReactNode } from 'react';
import './SectionHeading.css';

export interface SectionHeadingProps {
  level?: 2 | 3;
  children: ReactNode;
  /** Optional supporting line. Stacked under the heading, never beside it. */
  standfirst?: ReactNode;
  id?: string;
  /**
   * `<file>:<path>` into src/copy, making this string editable in the browser
   * under `npm run dev`. Dev tooling only: it renders as a plain data attribute
   * and does nothing in a build.
   */
  copyRef?: string;
  /**
   * `<file>:<path>` into src/copy, making this string editable in the browser
   * under `npm run dev`. Dev tooling only: it renders as a plain data attribute
   * and does nothing in a build.
   */
  standfirstCopyRef?: string;
}

/**
 * A case-study section header.
 *
 * There is deliberately no `eyebrow` prop. An eyebrow above every section is
 * the clearest tell that a page was generated rather than written, and a
 * section's position already categorises it. If one is genuinely needed, it is
 * a one-off in the page, not an affordance the component hands out.
 *
 * `standfirst` stacks below the heading. The split-header pattern (big heading
 * left, small paragraph right) is banned as a default.
 */
export function SectionHeading({ level = 2, children, standfirst, id, copyRef, standfirstCopyRef }: SectionHeadingProps) {
  const H = level === 3 ? 'h3' : 'h2';
  return (
    <header className="section-heading" data-level={level}>
      <H className="section-heading__title" id={id} data-copy={copyRef}>{children}</H>
      {standfirst && <p className="section-heading__standfirst" data-copy={standfirstCopyRef}>{standfirst}</p>}
    </header>
  );
}
