import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import './Parallax.css';

/**
 * Drives the drift where `animation-timeline` is unsupported.
 *
 * Does nothing at all in browsers that have it, which is the point: the CSS
 * path stays primary and runs off the main thread, and this only exists so the
 * effect is not silently absent everywhere else. Also bails on reduced motion,
 * matching the CSS.
 */
function useScrollFallback(ref: React.RefObject<HTMLElement | null>, drift: string, range: 'cover' | 'exit') {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', 'view()')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = el.querySelector<HTMLElement>('.parallax__image-layer');
    if (!layer) return;

    // Resolve the drift once, in pixels, rather than per frame.
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;height:${drift}`;
    el.appendChild(probe);
    const distance = probe.getBoundingClientRect().height;
    probe.remove();

    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      // Mirrors the CSS ranges exactly, or the two paths disagree.
      const progress = range === 'exit'
        // 0 with the top edge at the viewport top, 1 with the bottom edge there.
        ? Math.min(1, Math.max(0, -r.top / r.height))
        // 0 with the top edge at the viewport bottom, 1 with the bottom edge at the top.
        : Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      layer.style.transform = `translateY(${-progress * distance}px)`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      layer.style.transform = '';
    };
  }, [ref, drift, range]);
}

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
   * Which stretch of scrolling the drift is spread across.
   *
   * `cover` is the whole time the section overlaps the viewport, which is
   * right for a section in the middle of a page.
   *
   * `exit` runs from the section's top edge leaving the viewport top to its
   * bottom edge doing the same. Use it at the top of a page: there, `cover`
   * begins before the reader can scroll at all, so on a 78vh hero more than
   * half the range is unreachable and the drift looks like a fraction of what
   * was asked for.
   */
  range?: 'cover' | 'exit';
  /**
   * Darkens the lower part of the image so content over it clears AA.
   *
   * Measured against this project's hero image: unscrimmed, the brightest 1%
   * of the text area gives white 3.27:1, which fails. At `bg/scrim` under an
   * inverse band, 70% black, it is 7.99:1, and even the single brightest pixel
   * is 4.57:1. That is why the tonal key below is not optional.
   */
  scrim?: boolean;
  /** The LCP element on any page it opens. Should not lazy-load. */
  priority?: boolean;
  children?: ReactNode;
}

/**
 * A full-bleed image that drifts against the scroll, with content laid over it.
 *
 * Driven by a scroll-driven CSS animation wherever one is available, which runs
 * off the main thread and survives a busy page. The equivalent on revolut.com
 * sets `transform: translateY(-22.8333px)` inline from JavaScript on every
 * scroll event, which is the path this takes only as a fallback.
 *
 * The CSS path needs `overflow: clip` rather than `hidden` on the section.
 * `hidden` creates a scroll container, and `view()` resolves against the
 * nearest one, so the drift would be measured against a box that never
 * scrolls and the image would sit perfectly still.
 *
 * Reduced motion stops it in both paths.
 *
 * The section carries `data-on-media`, not a band role. Bands are relative:
 * `inverse` means this band in the other theme, so it flips with the theme.
 * A photograph does not. Over media the foreground has to be absolute or it
 * inverts in one of the two themes, which is white text in light mode and
 * dark text in dark mode over the same dark image.
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
  range = 'cover',
  scrim = true,
  priority = false,
  children
}: ParallaxProps) {
  const ref = useRef<HTMLElement>(null);
  useScrollFallback(ref, drift, range);

  return (
    <section
      ref={ref}
      className="parallax"
      data-on-media="true"
      data-range={range}
      data-scrim={scrim ? 'true' : undefined}
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
          <div className="measure">{children}</div>
        </div>
      )}
    </section>
  );
}
