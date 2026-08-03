import './Tag.css';
export interface TagProps { variant?: 'neutral' | 'accent'; children: React.ReactNode; }

/** Metadata only — role, year, platform. Not a button, not a filter, never on an image. */
export function Tag({ variant = 'neutral', children }: TagProps) {
  return <span className="tag" data-variant={variant}>{children}</span>;
}
