import './Contribution.css';

export interface ContributionItem {
  term: string;
  detail: string;
}

export interface ContributionProps {
  /**
   * Role, scope, team, duration. Keep "what I owned" and "what the team owned"
   * as separate entries: a reader asks what your specific role was, and a
   * combined answer reads as a claim on other people's work.
   */
  items: ContributionItem[];
}

/**
 * Who did what. Grouped pairs with one rule per row group rather than a
 * hairline under every line, which is the spec-table tell.
 */
export function Contribution({ items }: ContributionProps) {
  return (
    <dl className="contribution">
      {items.map((item) => (
        <div className="contribution__row" key={item.term}>
          <dt className="contribution__term">{item.term}</dt>
          <dd className="contribution__detail">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
