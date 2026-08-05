import './Media.css';
export type MediaRatio = '16-9' | '4-3' | '1-1' | '3-4';

export interface MediaProps {
  src?: string;
  /**
   * Responsive candidates for `src`, as an `img` srcset string.
   *
   * This stays a plain React component so Storybook and Chromatic treat it like
   * any other, which means it cannot import Astro's image pipeline. The page
   * calls `getImage()` and passes the result down.
   */
  srcSet?: string;
  /** How wide the image renders, for picking from `srcSet`. */
  sizes?: string;
  alt: string;
  ratio?: MediaRatio;
  /** bleed runs to the band edge and drops the radius; inset keeps r20. */
  fit?: 'inset' | 'bleed';
  caption?: string;
  /**
   * `<file>:<path>` into src/copy, making this string editable in the browser
   * under `npm run dev`. Dev tooling only: it renders as a plain data attribute
   * and does nothing in a build.
   */
  captionCopyRef?: string;
}

/**
 * Real screenshots and photography only. Never a product UI faked out of
 * rectangles — that is the single clearest tell in a portfolio.
 *
 * Caption sits below, outside the frame. No labels overlaid on the image, and
 * no decorative photo credits.
 */
export function Media({ src, srcSet, sizes, alt, ratio = '16-9', fit = 'inset', caption, captionCopyRef }: MediaProps) {
  return (
    <figure className="media" data-ratio={ratio} data-fit={fit}>
      <div className="media__frame">
        {src ? (
          <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} loading="lazy" decoding="async" />
        ) : (
          // A slot with nothing in it should say so. An invisible placeholder
          // reads as a finished section that happens to have a gap, which is
          // how images end up missing at the point someone else looks.
          <div className="media__placeholder">
            <span className="media__placeholder-kind">Image needed</span>
            <span className="media__placeholder-alt">{alt}</span>
            <span className="media__placeholder-meta">{ratio.replace('-', ':')}</span>
          </div>
        )}
      </div>
      {caption && <figcaption className="media__caption" data-copy={captionCopyRef}>{caption}</figcaption>}
    </figure>
  );
}
