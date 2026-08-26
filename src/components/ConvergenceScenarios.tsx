import type { CSSProperties } from 'react';
import './ConvergenceScenarios.css';
import type { ConvergenceScenario } from '../data/egds-convergence-scenarios';

export interface ConvergenceTrade {
  /** The pole at the top of the scale. */
  start: string;
  /** The pole at the bottom. */
  end: string;
}

export interface ConvergenceNotes {
  /** Sits beside the bracket spanning the middle rungs. */
  recommended: string;
  /** Sits beside the rung the business took. */
  chosen: string;
}

export interface ConvergenceScenariosProps {
  /**
   * The accessible name for the whole figure, and REQUIRED for the same reason
   * the other diagrams require one: a picture built from elements has no missing
   * image for anyone to notice, so an undescribed one ships looking finished and
   * nothing reports it.
   *
   * It has to carry what the unlabelled rungs mean. A sighted reader sees three
   * dots between two named ends and reads a spectrum; announced, three rungs
   * with no text are simply absent unless the description says they are there.
   */
  alt: string;
  /** Least ambitious first, so reading down is reading along the scale. */
  scenarios: ConvergenceScenario[];
  /** The two poles of the trade-off, as axis labels rather than values. */
  trade: ConvergenceTrade;
  /** The two annotations, and the only prose in the picture. */
  notes: ConvergenceNotes;
  caption?: string;
  /**
   * `<file>:<path>` into src/copy, making the caption editable in the browser
   * under `npm run dev`. Dev tooling only; inert in a build.
   */
  captionCopyRef?: string;
}

/**
 * Where the bracket starts, carries its label, and ends.
 *
 * Derived from the run rather than authored, so moving a rung into or out of the
 * recommendation is one edit in the data instead of three flags that have to
 * agree. The label goes on the middle of the run, which for the three the record
 * describes is the middle rung of five.
 */
function spanOf(scenarios: ConvergenceScenario[]) {
  const run = scenarios.flatMap((s, i) => (s.recommended ? [i] : []));
  if (run.length === 0) return () => undefined;
  const [first, last] = [run[0], run[run.length - 1]];
  const labelled = run[Math.floor(run.length / 2)];
  return (i: number) => {
    if (!scenarios[i].recommended) return undefined;
    const where = i === first ? 'start' : i === last ? 'end' : 'middle';
    return { where, labelled: i === labelled };
  };
}

/**
 * Five ways to converge four design systems, on one scale, with the one the
 * leads recommended and the one the business took both marked.
 *
 * THE UNLABELLED RUNGS ARE THE POINT, not an omission, and they are why this
 * component exists rather than a list. The record names the two ends of the
 * range and says the recommendation was "one of the middle options"; it does not
 * name the middle three, and inventing them would be fabricating the content of
 * a real artefact. Drawn as positions on a scale they say exactly what is known,
 * and the argument needs no more than that: a spectrum existed, the leads
 * recommended its middle, the business took its far end.
 *
 * For the same reason the recommendation is a BRACKET rather than a mark. "One
 * of the middle options" is vague in the record, and a bracket is that vagueness
 * drawn precisely where a dot would be a claim about which one.
 *
 * NO CONTROL, WHICH IS THE DELIBERATE DIFFERENCE from the two figures above it
 * on this page. Those hide a rejected alternative that cannot be drawn at the
 * same time as the shipped one, so a control is what lets a reader see both.
 * Here the recommendation and the choice are both on the scale at once and
 * nothing is hidden, so a toggle would be a device rather than content — and
 * three of them in one section is a tic a reader starts noticing instead of
 * reading.
 */
export function ConvergenceScenarios({
  alt, scenarios, trade, notes, caption, captionCopyRef
}: ConvergenceScenariosProps) {
  const span = spanOf(scenarios);

  return (
    <figure className="convergence-scenarios">
      {/*
        `role="img"` over the scale AND its two poles, because the poles are part
        of the picture rather than a caption on it: they carry the trade-off the
        exploration is about, which is the second dimension of the diagram.
      */}
      {/*
        The scenario count, hoisted so the stylesheet can find a node's centre.
        Nodes sit at column centres, so the outermost two are half a column in
        from the edges — which is `50% / count` and nothing CSS can derive on its
        own. Without it the axis labels and the two end captions align to the
        grid while the scale they describe is inset, and the figure reads as
        padded on both sides for no reason.
      */}
      <div
        className="convergence-scenarios__figure"
        role="img"
        aria-label={alt}
        style={{ '--cs-count': scenarios.length } as CSSProperties}
      >
        {/*
          The poles sit at the ENDS of the axis rather than above and below it,
          because the scale runs left to right. Drawn vertically first, and the
          measure is what settled it: five rungs stacked left about a third of the
          article column carrying two labels and three quarters of it empty, which
          reads as a figure with something missing rather than as a short one.
        */}
        <div className="convergence-scenarios__poles">
          <span className="convergence-scenarios__pole" data-pole="start">{trade.start}</span>
          <span className="convergence-scenarios__pole" data-pole="end">{trade.end}</span>
        </div>

        {/*
          Each rung renders four children in a fixed order and the list itself is
          `display: contents`, so the four land in four rows of the same column
          without a single explicit grid position. Auto-placement fills each row
          in source order, which is exactly the order the rungs are written in.

          The empty note slot is rendered even when a rung has no note, and that
          is load-bearing rather than tidy: drop it on four of the five and the
          fifth's note is placed in the first free cell of row one, which is
          column one, and the bracket's label lands over the wrong end of the
          scale.
        */}
        <ol className="convergence-scenarios__scale">
          {scenarios.map((scenario, i) => {
            const bracket = span(i);
            return (
              <li
                className="convergence-scenarios__rung"
                key={scenario.label ?? `rung-${i}`}
                data-chosen={scenario.chosen ? '' : undefined}
                data-named={scenario.label ? '' : undefined}
              >
                <span className="convergence-scenarios__note-slot">
                  {bracket?.labelled && (
                    <span className="convergence-scenarios__note" data-kind="recommended">
                      {notes.recommended}
                    </span>
                  )}
                </span>

                <span
                  className="convergence-scenarios__bracket"
                  data-where={bracket?.where}
                  aria-hidden="true"
                />

                {/* The rail cell. The line between rungs is this cell's own
                    pseudo element, so it cannot drift from the node it joins
                    however wide the column becomes. */}
                <span className="convergence-scenarios__rail">
                  <span className="convergence-scenarios__node" />
                </span>

                <span className="convergence-scenarios__body">
                  {scenario.label && (
                    <span className="convergence-scenarios__label">{scenario.label}</span>
                  )}
                  {scenario.chosen && (
                    <span className="convergence-scenarios__note" data-kind="chosen">
                      {notes.chosen}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {caption && (
        <figcaption className="convergence-scenarios__caption" data-copy={captionCopyRef}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
