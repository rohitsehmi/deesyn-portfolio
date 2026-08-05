import { Media, type MediaRatio } from './Media';
import './Explorations.css';

export interface Exploration {
  /** What the direction was, in the fewest words that identify it. */
  title: string;
  /**
   * Why it did not ship. The scored content of the whole component: a reviewer
   * is reading for a decision driven by evidence, not for a preference.
   */
  why: string;
  /**
   * A real artefact. Wireframe, flow, prototype still. Never a styled div.
   *
   * Plain data rather than a ReactNode slot, unlike Card: JSX written inside an
   * `.astro` expression produces an Astro template object, not a React element,
   * so a node slot cannot be filled from a page. An exploration always shows an
   * image, so there is nothing to vary and nothing lost.
   */
  image?: { src?: string; alt: string; ratio?: MediaRatio; caption?: string };
}

export interface ExplorationsProps {
  items: Exploration[];
  /**
   * `<file>:<path>` into src/copy for this list. The index and field are
   * appended, so a base of `study:items` yields `study:items.0.title`. Dev
   * tooling only; inert in a build.
   */
  copyBase?: string;
}

/**
 * The paths that were considered and rejected.
 *
 * This is the section most portfolios skip and the one a case study weights
 * hardest, so `why` is required on every item. An exploration without a stated
 * reason for its rejection is a picture, and pictures score nothing here.
 */
export function Explorations({ items, copyBase }: ExplorationsProps) {
  return (
    <ol className="explorations">
      {items.map((item, i) => (
        <li className="explorations__item" key={item.title}>
          {item.image && (
            <div className="explorations__media">
              <Media {...item.image} ratio={item.image.ratio ?? '4-3'} />
            </div>
          )}
          <div className="explorations__text">
            <h3 className="explorations__title" data-copy={copyBase && `${copyBase}.${i}.title`}>{item.title}</h3>
            <p className="explorations__why" data-copy={copyBase && `${copyBase}.${i}.why`}>{item.why}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
