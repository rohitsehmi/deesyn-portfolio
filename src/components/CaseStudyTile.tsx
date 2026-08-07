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
  image?: { src?: string; srcSet?: string; sizes?: string; alt: string; ratio?: MediaRatio };
  /**
   * `<file>:<path>` into src/copy for this tile's strings; `.title`, `.summary`
   * and `.discipline` are appended. Dev tooling only — inert in a build.
   *
   * The same tile renders on the index and as the next-study link at the foot
   * of the other study, both pointing at one entry in src/copy/studies.json, so
   * editing it in either place changes both.
   */
  copyBase?: string;
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
  image,
  copyBase
}: CaseStudyTileProps) {
  return (
    <article className="tile" data-variant={variant}>
      {image && (
        <div className="tile__media">
          <Media {...image} alt={image.alt} ratio={image.ratio ?? '16-9'} />
        </div>
      )}
      <div className="tile__body">
        <p className="tile__discipline" data-copy={copyBase && `${copyBase}.discipline`}>{discipline}</p>
        <h2 className="tile__title">
          <a className="tile__link" href={href} data-copy={copyBase && `${copyBase}.title`}>{title}</a>
        </h2>
        <p className="tile__summary" data-copy={copyBase && `${copyBase}.summary`}>{summary}</p>
        {/*
          Looks like an IconButton and is deliberately not one. The whole tile
          is already a link, and a real button here would be interactive content
          nested inside an anchor: invalid, and it puts a second stop in the tab
          order for something that does nothing the title link does not already
          do. It borrows the icon-button classes so the visual cannot drift from
          the real component, and is hidden from assistive tech.
        */}
        <div className="tile__cue-slot">
          <span className="tile__cue icon-button" data-variant="secondary" data-size="lg" aria-hidden="true">
            <Icon name="arrow-thin-right" size={24} />
          </span>
        </div>
      </div>
    </article>
  );
}
