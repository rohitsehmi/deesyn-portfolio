import type { ReactNode, CSSProperties } from 'react';
import type { BandRole } from './Band';
import './Parallax.css';

export interface ParallaxProps {
  src: string;
  alt: string;
  /**
   * How far the image travels across its whole time on screen. The image layer
   * is exactly this much taller than the section, so the section is covered at
   * every point in the range and can never show a gap.
   *
   * Keep it small. This reads as depth, not as movement.
   */
  drift?: string;
  /** Content-led height, per the hero note in the banding spec. */
  minHeight?: string;
  /**
   * Darkens the lower part of the image so content over it clears AA.
   *
   * Measured against this project's hero image: unscrimmed, the brightest 1%
   * of the text area gives white 3.27:1, which fails. At `bg/scrim` under an
   * inverse band, 70% black, it is 7.99:1, and even the single brightest pixel
   * is 4.57:1. That is why the tonal key below is not optional.
   */
  scrim?: boolean;
  /**
   * The tonal key this section sets. Applied as `data-band` without a scale,
   * because a hero is content-led and does not count toward the band
   * alternation. See the `hero` note in design/banding-export.json.
   */
  band?: BandRole;
  /**
   * Pulls the section up under a transparent nav so the image starts at the top
   * of the page and the nav floats over it, which is the whole point of the
   * pattern. Pair with `Nav overBand` so the nav takes this section's
   * foreground while it is still transparent.
   */
  underNav?: boolean;
  /** The LCP element on any page it opens. Should not lazy-load. */
  priority?: boolean;
  children?: ReactNode;
}

/**
 * A full-bleed image that drifts against the scroll, with content laid over it.
 *
 * Driven by a scroll-driven CSS animation, not a scroll handler. The equivalent
 * on revolut.com sets `transform: translateY(-22.8333px)` inline from
 * JavaScript on every scroll event; doing it in CSS runs it off the main
 * thread, survives a busy page, and keeps the page shipping zero JS.
 *
 * Where scroll-driven animations are unsupported the image sits still, which
 * is where `prefers-reduced-motion` lands too. One fallback, not two.
 *
 * The timing function is `linear` and must stay that way. Scroll position is
 * the timeline, so easing would decouple the image from the reader's finger.
 *
 * There is deliberately no entrance fade on the content. Revolut fades theirs
 * in over 300ms; on a hero that is the LCP element, and delaying the thing the
 * reader came for costs more than the polish returns.
 */
export function Parallax({
  src,
  alt,
  drift = '80px',
  minHeight = 'min(78vh, 720px)',
  scrim = true,
  band,
  underNav = false,
  priority = false,
  children
}: ParallaxProps) {
  return (
    <section
      className="parallax"
      data-band={band}
      data-scrim={scrim ? 'true' : undefined}
      data-under-nav={underNav ? 'true' : undefined}
      style={{ '--parallax-drift': drift, '--parallax-min-height': minHeight } as CSSProperties}
    >
      <div className="parallax__image-layer">
        <img
          className="parallax__image"
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
        />
      </div>
      {scrim && <div className="parallax__scrim" aria-hidden="true" />}
      {children && (
        <div className="parallax__content">
          <div className="band__measure">{children}</div>
        </div>
      )}
    </section>
  );
}
