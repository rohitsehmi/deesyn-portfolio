import './Media.css';
export type MediaRatio = '16-9' | '4-3' | '1-1' | '3-4';

export interface MediaProps {
  src?: string;
  alt: string;
  ratio?: MediaRatio;
  /** bleed runs to the band edge and drops the radius; inset keeps r20. */
  fit?: 'inset' | 'bleed';
  caption?: string;
}

/**
 * Real screenshots and photography only. Never a product UI faked out of
 * rectangles — that is the single clearest tell in a portfolio.
 *
 * Caption sits below, outside the frame. No labels overlaid on the image, and
 * no decorative photo credits.
 */
export function Media({ src, alt, ratio = '16-9', fit = 'inset', caption }: MediaProps) {
  return (
    <figure className="media" data-ratio={ratio} data-fit={fit}>
      <div className="media__frame">
        {src ? (
          <img src={src} alt={alt} loading="lazy" decoding="async" />
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
      {caption && <figcaption className="media__caption">{caption}</figcaption>}
    </figure>
  );
}
