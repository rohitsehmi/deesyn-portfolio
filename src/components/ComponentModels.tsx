import { useId } from 'react';
import './ComponentModels.css';
import type { ComponentDecision } from '../data/egds-component-models';

export interface ComponentModelLabels {
  /** "The original plan". */
  label: string;
  /** The one line under it, which is the whole difference between the two. */
  gloss: string;
}

export interface ComponentModelsChange {
  /**
   * The checkbox label, and the only instruction on the figure.
   *
   * It is also the only place the marked rows are named. A label beside each
   * mark was tried and cut for the reason the governance figure cut its own:
   * five copies of the same two words, four of them stacked in a grid where
   * they read as part of the structure rather than as an annotation on it.
   */
  toggle: string;
}

export interface ComponentModelsProps {
  /**
   * The accessible name for the whole figure, and REQUIRED for the same reason
   * `IconButton` requires `aria-label` and the other two diagrams require `alt`.
   *
   * It carries more weight here than on either of them, because the argument
   * this picture makes is a COUNT: four marks on the left against one on the
   * right. A sighted reader counts them; the alt has to say the number.
   */
  alt: string;
  /** The component the picture is drawn about. "Date picker". */
  subject: string;
  /** The four design languages, left to right and top to bottom. */
  languages: string[];
  /**
   * What a component carries. One of them is `perBrand`, which is what moves to
   * the right-hand model's token chips, and one is `changes`, which is what the
   * control marks.
   */
  decisions: ComponentDecision[];
  /** The two headers. Abandoned first: it was the plan first. */
  models: { abandoned: ComponentModelLabels; shipped: ComponentModelLabels };
  /** The eyebrow on the shipped component, naming whose component it is. */
  base: string;
  /**
   * The change, as a control rather than a caption.
   *
   * Optional: without it the figure is the two structures and nothing else,
   * which is the right thing to render anywhere the cost of a change is not the
   * subject.
   */
  change?: ComponentModelsChange;
  /**
   * Start with the change showing. Off by default, because the structures are
   * the honest resting state and the count is what a reader goes looking for.
   *
   * It exists so a story can snapshot the second state, since Chromatic
   * photographs a page rather than operating one — the same reason
   * `GovernanceTiers` takes a `defaultRejected`.
   */
  defaultChanged?: boolean;
  caption?: string;
  /**
   * `<file>:<path>` into src/copy, making the caption editable in the browser
   * under `npm run dev`. Dev tooling only; inert in a build.
   */
  captionCopyRef?: string;
}

/**
 * One stack of decision rows. `data-changes` is set from the datum rather than
 * from a position, so reordering the list moves the mark with the row it
 * belongs to instead of leaving it on whatever ends up second.
 */
function Decisions({ items }: { items: ComponentDecision[] }) {
  return (
    <ul className="component-models__decisions">
      {items.map((d) => (
        <li
          className="component-models__decision"
          key={d.label}
          data-changes={d.changes ? '' : undefined}
        >
          {d.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * The rebuild that was abandoned partway through, drawn beside the thing that
 * replaced it: four design languages inside every component, against one base
 * component with brand tokens on top.
 *
 * IT ILLUSTRATES A REJECTED EXPLORATION, which decides its shape, the same way
 * the governance ladder's shape follows from illustrating one. The reader has
 * just been told that every component carried four sets of decisions and that
 * every later change had to be correct in four places at once. That sentence is
 * a count, and a count is a thing to show rather than a thing to say, so the
 * control marks the row a change lands on and the reader finds it four times on
 * the left and once on the right.
 *
 * THE FIDELITY COST IS DRAWN TOO, and it has to be. The exploration admits in
 * words that the pivot cost some fidelity, and a picture where the right-hand
 * model is all upside would be arguing with the paragraph beside it. So exactly
 * one decision moves out to the brand chips: what shipped lets a brand differ on
 * how a component looks and not on how it is built, and that is visible before
 * anybody touches the control.
 *
 * NO COLOUR OF ITS OWN, like the governance figure and unlike the token-tiers
 * one. This depicts a structure rather than somebody else's palette, so every
 * tone is a token, it repaints with the brand pack, and both themes come out
 * right without a second export or a second set of values.
 *
 * Interactive with no JavaScript, on the same mechanism: one native checkbox and
 * `:has()`. `:has()` is what makes it possible at all, since the thing being
 * marked sits below the control in the document but the marks are spread across
 * two columns that `~` could never reach into.
 */
export function ComponentModels({
  alt, subject, languages, decisions, models, base, change, defaultChanged,
  caption, captionCopyRef
}: ComponentModelsProps) {
  const shared = decisions.filter((d) => !d.perBrand);
  const perBrand = decisions.filter((d) => d.perBrand);

  if (perBrand.length === 0) {
    throw new Error(
      'ComponentModels: no decision is marked `perBrand`, so the shipped model has ' +
      'nothing for its brand tokens to carry and draws four empty chips. Mark the ' +
      'decision a brand overrides — see COMPONENT_DECISIONS in src/data/egds-component-models.ts.'
    );
  }

  const id = useId();

  return (
    <figure className="component-models">
      <div className="component-models__figure">
        {change && (
          <div className="component-models__control">
            {/*
              A real checkbox, visually replaced rather than hidden: it keeps the
              space bar, the focus ring and the announced state, none of which a
              div with an onClick would have had, and all of which the browser
              gives away for nothing.
            */}
            <input
              className="component-models__toggle"
              type="checkbox"
              id={id}
              defaultChecked={defaultChanged}
            />
            <label className="component-models__toggle-label" htmlFor={id}>{change.toggle}</label>
          </div>
        )}

        {/*
          `role="img"` over the two models only, never over the control. The
          control is a control; a checkbox inside a region announced as a picture
          is one assistive technology has been told to skip.
        */}
        <div className="component-models__models" role="img" aria-label={alt}>
          <section className="component-models__model" data-model="abandoned">
            <header className="component-models__header">
              <h4 className="component-models__label">{models.abandoned.label}</h4>
              <p className="component-models__gloss">{models.abandoned.gloss}</p>
            </header>
            {/*
              One block containing four, which is the abandoned plan stated as a
              shape: the design languages are INSIDE the component rather than
              applied to it, so the boundary has to be drawn round all four.
            */}
            <div className="component-models__block" data-role="composite">
              <span className="component-models__block-label">{subject}</span>
              <div className="component-models__languages">
                {languages.map((language) => (
                  <div className="component-models__language" key={language}>
                    <span className="component-models__language-label">{language}</span>
                    {/* Every decision, four times over. The repetition IS the argument. */}
                    <Decisions items={decisions} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="component-models__model" data-model="shipped">
            <header className="component-models__header">
              <h4 className="component-models__label">{models.shipped.label}</h4>
              <p className="component-models__gloss">{models.shipped.gloss}</p>
            </header>
            {/*
              The chips sit ABOVE the component they resolve for, and the order is
              the argument rather than a layout preference: tokens are applied on
              top of a base, so the picture reads downward as "these four resolve
              this one" instead of sideways as "these five things exist".
            */}
            <div className="component-models__tokens">
              {languages.map((language) => (
                <div className="component-models__token" key={language}>
                  <span className="component-models__language-label">{language}</span>
                  <Decisions items={perBrand} />
                </div>
              ))}
            </div>
            <span className="component-models__feed" aria-hidden="true" />
            <div className="component-models__block" data-role="base">
              <span className="component-models__block-label">
                {subject}
                <span className="component-models__block-eyebrow">{base}</span>
              </span>
              <Decisions items={shared} />
            </div>
          </section>
        </div>
      </div>
      {caption && (
        <figcaption className="component-models__caption" data-copy={captionCopyRef}>{caption}</figcaption>
      )}
    </figure>
  );
}
