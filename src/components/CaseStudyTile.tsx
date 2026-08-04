import { Media, type MediaRatio } from './Media';
import './CaseStudyTile.css';

export interface CaseStudyTileProps {
  title: string;
  /** One line that says what the problem was. It has to earn the click. */
  summary: string;
  /** The discipline this study argues for. Two studies, two disciplines. */
  discipline: string;
  href: string;
  /**
   * Plain data rather than a ReactNode slot: JSX written inside an `.astro`
   * expression produces an Astro template object, not a React element.
   */
  image?: { src?: string; alt: string; ratio?: MediaRatio };
}

/**
 * The whole tile is the link, so there is no separate "read more" affordance
 * competing with it for the same intent.
 *
 * The discipline label is the one piece of metadata that earns its place: with
 * only two studies, which discipline each argues for is the thing a reader is
 * scanning for. It is not an eyebrow and there is no second one.
 */
export function CaseStudyTile({ title, summary, discipline, href, image }: CaseStudyTileProps) {
  return (
    <a className="tile" href={href}>
      {image && (
        <div className="tile__media">
          <Media {...image} alt={image.alt} ratio={image.ratio ?? '16-9'} />
        </div>
      )}
      <div className="tile__body">
        <p className="tile__discipline">{discipline}</p>
        <h3 className="tile__title">{title}</h3>
        <p className="tile__summary">{summary}</p>
      </div>
    </a>
  );
}
