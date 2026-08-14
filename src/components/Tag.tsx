import './Tag.css';
export interface TagProps {
  variant?: 'neutral' | 'accent';
  /**
   * `<file>:<path>` into src/copy for the label, making it editable in the
   * browser under `npm run dev`. It sits on the element that directly contains
   * the string, which is what the editor writes back from. Dev tooling only —
   * it renders as a plain data attribute and does nothing in a build.
   */
  copyRef?: string;
  children: React.ReactNode;
}

/** Metadata only — role, year, platform. Not a button, not a filter, never on an image. */
export function Tag({ variant = 'neutral', copyRef, children }: TagProps) {
  return <span className="tag" data-variant={variant} data-copy={copyRef}>{children}</span>;
}
