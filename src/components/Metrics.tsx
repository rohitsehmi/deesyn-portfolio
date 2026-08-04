import './Metrics.css';

export interface Metric {
  /** The headline number, formatted for reading: "3.2x", "41%", "12s". */
  value: string;
  /** What it measures. A full phrase, not a category noun. */
  label: string;
  /** The prior value, when the argument is a change rather than a level. */
  from?: string;
}

export interface MetricsProps {
  /** Two to four. Past four this is a data dump, not an argument. */
  items: Metric[];
  /**
   * Where the numbers come from: instrument, window, sample size.
   *
   * Required, not optional. An unsourced number in a case study is a
   * credibility failure rather than a design one, and this is the one prop a
   * reviewer will check hardest. If the provenance is genuinely unavailable,
   * say so here in words rather than leaving it blank.
   */
  source: string;
}

/**
 * Impact tiles. Display scale, no table, no filled progress tracks, no
 * comparison bars. The number carries the argument on its own.
 *
 * Cell count always equals item count, so a grid never ends on a blank tile.
 */
export function Metrics({ items, source }: MetricsProps) {
  return (
    <div className="metrics">
      <dl className="metrics__grid" data-count={Math.min(items.length, 4)}>
        {items.map((m) => (
          <div className="metrics__item" key={m.label}>
            <dt className="metrics__value">{m.value}</dt>
            <dd className="metrics__label">
              {m.label}
              {m.from && <span className="metrics__from">previously {m.from}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="metrics__source">{source}</p>
    </div>
  );
}
