import './Parallax.css';
import type { MediaRatio } from './Media';

export interface ParallaxProps {
  src: string;
  alt: string;
  /** The window's shape. The image is covered into it and drifts inside. */
  ratio?: MediaRatio;
  /**
   * How far the image travels across its whole time on screen. The inner column
   * is exactly this much taller than the window, so the window is covered at
   * every point in the range and can never show a gap.
   *
   * Keep it small. This reads as depth, not as movement; past about 100px it
   * stops looking like parallax and starts looking like a bug.
   */
  drift?: string;
  /** Full-bleed heroes should not lazy-load: this is usually the LCP element. */
  priority?: boolean;
}

/**
 * An image that drifts against the scroll, so the band it sits in gains depth
 * without anything moving on its own.
 *
 * Driven by a scroll-driven CSS animation rather than a scroll handler. The
 * effect on revolut.com sets `transform: translateY(50.3333px)` inline from
 * JavaScript on every scroll event; doing it in CSS runs it off the main
 * thread, survives a busy page, and keeps this component shipping zero JS.
 *
 * Where scroll-driven animations are unsupported the image simply sits still,
 * which is the same place `prefers-reduced-motion` lands. Nothing is lost but
 * the depth.
 *
 * The timing function is `linear` and must stay that way. Scroll position is
 * the timeline, so easing would decouple the image from the reader's finger.
 */
export function Parallax({ src, alt, ratio = '16-9', drift = '80px', priority = false }: ParallaxProps) {
  return (
    <div className="parallax" data-ratio={ratio} style={{ '--parallax-drift': drift } as React.CSSProperties}>
      <div className="parallax__inner">
        <img
          className="parallax__image"
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
        />
      </div>
    </div>
  );
}
