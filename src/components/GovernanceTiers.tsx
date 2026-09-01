import { useId } from 'react';
import './GovernanceTiers.css';
import type { GovernanceStage, GovernanceTier } from '../data/egds-governance-tiers';

export interface GovernanceTiersLabels {
  core: string;
  shared: string;
  team: string;
}

export interface GovernanceTiersRejected {
  /**
   * The checkbox label, and the only instruction on the figure.
   *
   * It is also the only place the dashed route is named. A label per panel was
   * tried and cut: three copies of the same two words, one of which landed on
   * top of the shared tier it was drawn to avoid.
   */
  toggle: string;
}

export interface GovernanceTiersProps {
  /**
   * The accessible name for the whole figure, and REQUIRED for the same reason
   * `IconButton` requires `aria-label` and `TokenTiers` requires `alt`.
   *
   * A picture built from elements has no missing image for anyone to notice, so
   * an undescribed one ships looking finished and nothing reports it.
   */
  alt: string;
  /** Team, shared, core. Rendered in the order given, left to right. */
  stages: GovernanceStage[];
  /** The three tier names, drawn on every panel. */
  tiers: GovernanceTiersLabels;
  /**
   * The rejected model, as a control rather than a caption.
   *
   * Optional: without it the figure is the shipped ladder and nothing else,
   * which is the right thing to render anywhere the rejected path is not the
   * subject.
   */
  rejected?: GovernanceTiersRejected;
  /**
   * Start with the rejected path showing. Off by default, because the shipped
   * ladder is the honest resting state.
   *
   * It exists so a story can snapshot the second state, since Chromatic
   * photographs a page rather than operating one — the same reason `TokenTiers`
   * takes a `defaultBrand`.
   */
  defaultRejected?: boolean;
  caption?: string;
  /**
   * `<file>:<path>` into src/copy, making the caption editable in the browser
   * under `npm run dev`. Dev tooling only; inert in a build.
   */
  captionCopyRef?: string;
}

/** The order the ladder climbs, so a node knows whether the component reached it. */
const RANK: Record<GovernanceTier, number> = { team: 1, shared: 2, core: 3 };

/**
 * One node. `state` is derived rather than authored: a tier is reached, current,
 * or still ahead, and that is a fact about the stage rather than a decision.
 */
function Node({ tier, label, reached, gate }: {
  tier: GovernanceTier; label: string; reached: GovernanceTier; gate?: string;
}) {
  const state = RANK[tier] === RANK[reached] ? 'current' : RANK[tier] < RANK[reached] ? 'passed' : 'ahead';
  return (
    <span className="governance-tiers__node" data-tier={tier} data-state={state}>
      <span className="governance-tiers__node-label">{label}</span>
      {/*
        The gate rides on the node it let the component into, rather than
        floating on the connector. A gate is a thing you get through to arrive
        somewhere, and attaching it to the arrival point is what makes the three
        panels read as one journey instead of three diagrams.
      */}
      {gate && <span className="governance-tiers__gate">{gate}</span>}
    </span>
  );
}

/**
 * How a component earned its way into the shared library: three tiers, three
 * gates, and the route that was rejected drawn straight through all of them.
 *
 * IT ILLUSTRATES A REJECTED EXPLORATION, which decides its shape. The reader has
 * just been told that letting any team push into core is the fastest way to
 * fill a core library with components only one team can maintain. So the figure
 * shows the ladder that shipped, and the control removes the gates rather than
 * describing their absence: the rejected model IS this picture with three things
 * taken out of it, and that is a thing to show rather than a thing to say.
 *
 * NO COLOUR OF ITS OWN. Unlike the token-tiers figure beside it, this depicts a
 * process rather than somebody else's palette, so there is nothing here that has
 * to stay absolute. Every tone is a token, it repaints with the brand pack, and
 * both themes come out right without a second export or a second set of values.
 *
 * Interactive with no JavaScript, on the same mechanism: one native checkbox and
 * `:has()`. A page that ships no runtime for a diagram can afford to have the
 * diagram do something.
 */
export function GovernanceTiers({
  alt, stages, tiers, rejected, defaultRejected, caption, captionCopyRef
}: GovernanceTiersProps) {
  const id = useId();
  return (
    <figure className="governance-tiers">
      <div className="governance-tiers__figure">
        {rejected && (
          <div className="governance-tiers__control">
            {/*
              A real checkbox, visually replaced rather than hidden: it keeps the
              space bar, the focus ring and the announced state, none of which a
              div with an onClick would have had, and all of which the browser
              gives away for nothing.
            */}
            <input
              className="governance-tiers__toggle"
              type="checkbox"
              id={id}
              defaultChecked={defaultRejected}
            />
            <label className="governance-tiers__toggle-label" htmlFor={id}>{rejected.toggle}</label>
          </div>
        )}

        {/*
          `role="img"` over the panels only, never over the control. The control
          is a control; a checkbox inside a region announced as a picture is one
          assistive technology has been told to skip.

          IT SITS ON A WRAPPER RATHER THAN ON THE <ol>, corrected 2026-09-01.
          On the list itself it overrode the implicit `list` role, which left
          every <li> without the parent its own role requires — the only two axe
          violations on the whole site, `listitem` (serious) and
          `aria-allowed-role`, in both themes. The three sibling diagrams all
          put it on a wrapping div already; this was the odd one out.

          A plain block wrapper, not `display: contents`: contents can drop an
          element out of the accessibility tree in some engines, which on the
          node carrying the role would delete the very thing being fixed. The
          parent is a flex column, so the wrapper simply becomes the flex item
          in the list's place — verified inert by pixel-diffing the figure
          before and after rather than by reasoning about it.
        */}
        <div role="img" aria-label={alt}>
        <ol className="governance-tiers__stages">
          {stages.map((stage) => (
            <li
              className="governance-tiers__stage"
              key={stage.label}
            >
              <span className="governance-tiers__stage-label">{stage.label}</span>
              <div className="governance-tiers__tree">
                <Node tier="core" label={tiers.core} reached={stage.reached}
                  gate={stage.reached === 'core' ? stage.gate : undefined} />
                <span className="governance-tiers__link" />
                <Node tier="shared" label={tiers.shared} reached={stage.reached}
                  gate={stage.reached === 'shared' ? stage.gate : undefined} />
                <span className="governance-tiers__fork" />
                <div className="governance-tiers__teams">
                  {/*
                    Two teams, because one cannot show a shared tier. The second
                    is the one carrying the component, which is why only it takes
                    the gate at the team stage.
                  */}
                  <Node tier="team" label={tiers.team} reached="core" />
                  <Node tier="team" label={tiers.team} reached={stage.reached}
                    gate={stage.reached === 'team' ? stage.gate : undefined} />
                </div>
                {/*
                  The rejected route. Dashed, because it is the one path here
                  that was never built, and drawn outside the tree so it visibly
                  goes round the shared tier rather than through it.

                  It carries NO label of its own. Three panels would have meant
                  three copies of the same two words, and the control an inch
                  above already says what the dashed line is.
                */}
                {rejected && <span className="governance-tiers__bypass" aria-hidden="true" />}
              </div>
            </li>
          ))}
        </ol>
        </div>
      </div>
      {caption && (
        <figcaption className="governance-tiers__caption" data-copy={captionCopyRef}>{caption}</figcaption>
      )}
    </figure>
  );
}
