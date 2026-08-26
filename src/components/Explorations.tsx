import { Media, type MediaRatio } from './Media';
import { Carousel, type CarouselProps } from './Carousel';
import { GovernanceTiers, type GovernanceTiersProps } from './GovernanceTiers';
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
  image?: {
    src?: string;
    /** Spread straight into Media; the page builds them with Astro's getImage. */
    srcSet?: string;
    /** Dark-theme counterpart, for artwork that carries the theme in its fills. */
    srcDark?: string;
    srcSetDark?: string;
    sizes?: string;
    alt: string;
    ratio?: MediaRatio;
    caption?: string;
  };
  /**
   * A gallery instead of a single still, for an exploration whose variants are
   * better read one at a time than lined up at a third of the width each.
   *
   * Mutually exclusive with `image`, and `image` wins if both are supplied, so
   * a half-finished edit renders the still rather than nothing.
   */
  carousel?: CarouselProps;
  /**
   * A diagram drawn in elements, for an exploration whose artefact is an
   * argument about structure rather than a screen.
   *
   * Plain data for the same reason `carousel` is: JSX written inside an
   * `.astro` expression is an Astro template object, not a React element, so a
   * node slot cannot be filled from a page. `image` still wins if both are
   * supplied, so a half-finished edit renders the placeholder rather than
   * nothing.
   */
  diagram?: GovernanceTiersProps;
}

export interface ExplorationsProps {
  items: Exploration[];
  /**
   * `grid` puts two per row above 768px, which suits a single screen or a
   * wireframe. `stack` gives each one the full measure.
   *
   * Not cosmetic: a wide comparison — three phones side by side, or a Figma
   * window with a panel open — is illegible at half measure, and an artefact
   * nobody can read is worth less than the paragraph beside it. Pick by what
   * the picture is, not by how many there are.
   */
  layout?: 'grid' | 'stack';
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
export function Explorations({ items, copyBase, layout = 'grid' }: ExplorationsProps) {
  return (
    <ol className="explorations" data-layout={layout}>
      {items.map((item, i) => (
        <li className="explorations__item" key={item.title}>
          {item.image ? (
            <div className="explorations__media" data-kind="image">
              <Media {...item.image} ratio={item.image.ratio ?? '4-3'} />
            </div>
          ) : item.carousel ? (
            <div className="explorations__media" data-kind="carousel">
              <Carousel {...item.carousel} />
            </div>
          ) : item.diagram ? (
            <div className="explorations__media" data-kind="diagram">
              <GovernanceTiers {...item.diagram} />
            </div>
          ) : null}
          <div className="explorations__text">
            <h3 className="explorations__title" data-copy={copyBase && `${copyBase}.${i}.title`}>{item.title}</h3>
            <p className="explorations__why" data-copy={copyBase && `${copyBase}.${i}.why`}>{item.why}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
