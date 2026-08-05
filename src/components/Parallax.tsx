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
   * Responsive candidates for `src`, as an `img` srcset string.
   *
   * This component stays a plain React component so Storybook and Chromatic
   * treat it like any other, which means it cannot import Astro's image
   * pipeline. The page does that and passes the result down: `getImage()` in
   * `index.astro` emits the WebP widths, this renders them.
   *
   * Without it the browser gets one file at one size. The source hero is a
   * 3840x2400 PNG, and it is the LCP element on the page it opens.
   */
  srcSet?: string;
  /** How wide the image renders. Full-bleed here, so `100vw`. */
  sizes?: string;
  /*
    Deliberately no width/height. There is nothing for them to reserve: the
    image layer is `position: absolute; inset: 0`, so it is out of flow and the
    section's height comes from `min-height` and its content. The intrinsic size
    cannot move anything, and passing it means reading it off the source file —
    which is what pulls the unoptimised original into the build output.
  */
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
   * The tonality of the image, which is a property of the file and not of the
   * theme. `dark` puts the light foreground over it, `light` the dark one.
   *
   * This is the half of "media is absolute" that the first version left
   * implicit. Absolute is not the same as dark: the rule is that the image does
   * not flip with the theme, not that every image is a dark photograph. Get it
   * wrong on a pale image and the only way back to AA is a scrim heavy enough
   * to destroy the thing it is protecting — measured on this project's hero,
   * white text needed the full 70% black, and at 70% the image is gone.
   */
  tone?: 'dark' | 'light';
  /**
   * `object-position` for the image, as plain CSS.
   *
   * Matters far more than it looks. The section is full-bleed and the image is
   * `object-fit: cover`, so a narrow viewport crops it hard on the horizontal —
   * at 390px this project's hero loses about two thirds of its width. Centred,
   * the part it keeps is the middle, and if the image's quiet area is off to
   * one side the text lands on the busiest region of the picture at exactly the
   * width where there is least room to recover.
   *
   * Measured here: centred, the pale hero failed AA on 33% of glyph pixels at
   * 390px while passing comfortably at 1440px. Anchoring left fixed it and
   * changed nothing on desktop, where the image is not cropped horizontally at
   * all.
   */
  objectPosition?: string;
  /**
   * Darkens the lower part of the image so content over it clears AA.
   *
   * Defaults to on for a dark image and off for a light one, because a black
   * scrim under a dark foreground actively removes contrast rather than adding
   * it. A pale image earns legibility from composition instead — see the
   * measured quiet-zone widths in `design/measure-media-contrast.mjs`.
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
 * `tone` picks which absolute. It is a property of the image file, not of the
 * page, and it is the one thing here that cannot be inferred: only a person
 * looking at the picture knows whether it is dark or pale.
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
  srcSet,
  sizes,
  drift = '80px',
  minHeight = 'min(78vh, 720px)',
  range = 'cover',
  tone = 'dark',
  objectPosition = 'center',
  scrim = tone === 'dark',
  priority = false,
  children
}: ParallaxProps) {
  const ref = useRef<HTMLElement>(null);
  useScrollFallback(ref, drift, range);

  return (
    <section
      ref={ref}
      className="parallax"
      data-on-media={tone === 'light' ? 'light' : 'true'}
      data-range={range}
      data-scrim={scrim ? 'true' : undefined}
      style={{ '--parallax-drift': drift, '--parallax-min-height': minHeight, '--parallax-object-position': objectPosition } as CSSProperties}
    >
      <div className="parallax__image-layer">
        <img
          className="parallax__image"
          src={src}
          srcSet={srcSet}
          sizes={sizes}
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
