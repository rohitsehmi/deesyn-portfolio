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
        {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : <span className="media__placeholder" role="img" aria-label={alt} />}
      </div>
      {caption && <figcaption className="media__caption">{caption}</figcaption>}
    </figure>
  );
}
