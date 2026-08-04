import { Media, type MediaRatio } from './Media';
import { Icon } from './Icon';
import './CaseStudyTile.css';

export interface CaseStudyTileProps {
  title: string;
  /** One line that says what the problem was. It has to earn the click. */
  summary: string;
  /** The discipline this study argues for. Two studies, two disciplines. */
  discipline: string;
  href: string;
  /**
   * `bare` groups by image and spacing, the way revolut.com does. `card` puts
   * it on a surface with a border.
   *
   * Cards are the lazy grouping: the band already separates this section, and
   * with no shadows available in site chrome a card cannot do the one thing
   * cards are for. Kept as an option because the affordance question is real.
   */
  variant?: 'bare' | 'card';
  /**
   * Plain data rather than a ReactNode slot: JSX written inside an `.astro`
   * expression produces an Astro template object, not a React element.
   */
  image?: { src?: string; alt: string; ratio?: MediaRatio };
}

/**
 * The link is on the title, and a stretched pseudo element makes the whole tile
 * clickable.
 *
 * The obvious approach, wrapping everything in one anchor, gives the link an
 * accessible name of the discipline plus the title plus the whole summary,
 * which is what a screen reader then reads out in a list of links. It also
 * makes it impossible to put any other link inside. This way the accessible
 * name is the title alone and the click target is still the whole tile.
 *
 * The cue is aria-hidden for the same reason: it is a visual signal that the
 * tile is clickable, and repeating it to a screen reader adds nothing to a link
 * that already says what it is.
 */
export function CaseStudyTile({
  title,
  summary,
  discipline,
  href,
  variant = 'bare',
  image
}: CaseStudyTileProps) {
  return (
    <article className="tile" data-variant={variant}>
      {image && (
        <div className="tile__media">
          <Media {...image} alt={image.alt} ratio={image.ratio ?? '16-9'} />
        </div>
      )}
      <div className="tile__body">
        <p className="tile__discipline">{discipline}</p>
        <h3 className="tile__title">
          <a className="tile__link" href={href}>{title}</a>
        </h3>
        <p className="tile__summary">{summary}</p>
        <span className="tile__cue" aria-hidden="true">
          Read the case study
          <Icon name="arrow-thin-right" size={16} />
        </span>
      </div>
    </article>
  );
}
