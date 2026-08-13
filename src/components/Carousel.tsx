import './Carousel.css';
import { IconButton } from './IconButton';

export interface CarouselSlide {
  src?: string;
  /** Responsive candidates, built by the page with Astro's getImage. */
  srcSet?: string;
  /**
   * Required on every slide, for the same reason Metrics requires `source`.
   * A gallery is a list of claims about the work, and an unlabelled one is a
   * picture nobody can read.
   */
  alt: string;
  /** Shown under the stage while this slide is current. Optional. */
  label?: string;
}

export interface CarouselBackdrop {
  src: string;
  srcSet?: string;
  /** Dark counterpart. Same position and crop, so nothing shifts on a theme change. */
  srcDark?: string;
  srcSetDark?: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  /**
   * Names the region. Required: `aria-roledescription="carousel"` replaces the
   * role announcement, so without a label the thing announces its type and
   * nothing about its content.
   */
  label: string;
  /** How wide a slide renders, for picking from `srcSet`. */
  sizes?: string;
  /**
   * The plate the slides sit on. Absent falls back to a token-built gradient,
   * which is what the stories use.
   *
   * It is deliberately NOT part of the slides. Baking the backdrop into each
   * exported image means every advance repaints it, and any difference between
   * exports — a pixel of crop, a re-rendered gradient — reads as the background
   * twitching. One element behind a transparent track cannot twitch, and it
   * holds still across a theme change too, because only the fill swaps while
   * the box, the crop and the position stay where they are.
   */
  backdrop?: CarouselBackdrop;
  /**
   * Milliseconds between automatic advances. 0 disables autoplay.
   *
   * Not a duration token, and deliberately so: the motion scale describes how
   * long a thing takes to move, and this is how long it sits still. Binding a
   * dwell to `duration/*` would put a number on that scale which no transition
   * ever uses.
   */
  autoplayMs?: number;
  /**
   * A standing caption for the gallery as a whole, below the per-slide label.
   *
   * The two say different things and both are worth having: the label names
   * what is currently on screen and changes under the arrows, the caption makes
   * the argument the whole set exists to make.
   */
  caption?: string;
  /** `<file>:<path>` into src/copy, making the caption editable in the browser. */
  captionCopyRef?: string;
}

/**
 * A gallery of real screens, one at a time.
 *
 * Built on scroll-snap rather than a transform track, which decides most of
 * what follows. With JavaScript off or still loading, this is a horizontally
 * scrollable list of images that swipes natively on a phone and scrolls with
 * the keyboard: the content is all in the HTML and none of it depends on the
 * script. The script adds the arrows, the dots and the autoplay on top.
 *
 * That is also why the controls are hidden until the script marks the root as
 * enhanced. A visible arrow that does nothing is worse than no arrow.
 *
 * The transition is the platform's own scroll, not a tokenised animation. That
 * is the one deliberate exception to binding motion to the scale: scroll
 * physics belong to the device, they are interruptible by definition, and a
 * hand-timed transform would take that away to gain nothing.
 */
export function Carousel({ slides, label, sizes, backdrop, autoplayMs = 0, caption, captionCopyRef }: CarouselProps) {
  const count = slides.length;
  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label={label}
      data-carousel
      data-autoplay-ms={autoplayMs || undefined}
    >
      <div className="carousel__stage">
        <div className="carousel__backdrop" aria-hidden="true">
          {backdrop && (
            <>
              <img
                src={backdrop.src}
                srcSet={backdrop.srcSet}
                alt=""
                data-theme-img={backdrop.srcDark ? 'light' : undefined}
                loading="lazy"
                decoding="async"
              />
              {backdrop.srcDark && (
                <img
                  src={backdrop.srcDark}
                  srcSet={backdrop.srcSetDark}
                  alt=""
                  data-theme-img="dark"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </>
          )}
        </div>
        {/*
          tabindex on the track is not decorative. A scroll container that only
          responds to the mouse wheel is unreachable by keyboard, and this one
          has to keep working when the script never runs.
        */}
        {/*
          The arrows sit over the stage, vertically centred, and the slides are
          padded clear of them so nothing is hidden underneath. The wrapper is
          inset-0 and pointer-events:none — without that it would swallow the
          swipe it is sitting on top of.

          Both are chevron-right: the icon set has no chevron-left, and prev is
          mirrored in CSS. Same move as `arrow-up-right`, which is ArrowThinRight
          rotated 45 degrees because Revolut ships no diagonal arrow. The
          alternative is a real chevron-left in the Figma set, which is a change
          to a checksummed component and worth doing deliberately, not in
          passing.
        */}
        <div className="carousel__arrows" data-carousel-controls aria-hidden="false">
          <IconButton icon="chevron-right" aria-label="Previous screen" variant="secondary" size="md" data-carousel-prev />
          <IconButton icon="chevron-right" aria-label="Next screen" variant="secondary" size="md" data-carousel-next />
        </div>
        <ul className="carousel__track" data-carousel-track tabIndex={0}>
          {slides.map((slide, i) => (
            <li
              className="carousel__slide"
              key={slide.alt}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              {slide.src ? (
                // data-label carries the caption so the script reads it back
                // off the markup rather than keeping a second list of its own.
                <img
                  src={slide.src}
                  srcSet={slide.srcSet}
                  sizes={sizes}
                  alt={slide.alt}
                  data-label={slide.label}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ) : (
                <div className="carousel__placeholder">
                  <span className="carousel__placeholder-kind">Image needed</span>
                  <span className="carousel__placeholder-alt">{slide.alt}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="carousel__indicators" data-carousel-controls>
        <ol className="carousel__dots">
          {slides.map((slide, i) => (
            <li key={slide.alt}>
              {/*
                The button is the target and the mark inside it is the dot. 24px
                square is the WCAG 2.5.8 minimum, and the visible mark stays
                small so it still reads as an indicator rather than a button.
              */}
              <button
                type="button"
                className="carousel__dot"
                data-carousel-dot={i}
                aria-label={`Screen ${i + 1} of ${count}`}
                aria-current={i === 0 ? 'true' : undefined}
              >
                <span className="carousel__dot-mark" />
              </button>
            </li>
          ))}
        </ol>
      </div>

      {slides.some((s) => s.label) && (
        // aria-live so the label is announced when it changes under the
        // arrows. polite, not assertive: it is a label, not an alert.
        <p className="carousel__label" data-carousel-label aria-live="polite">
          {slides[0].label}
        </p>
      )}
      {caption && (
        <p className="carousel__caption" data-copy={captionCopyRef}>{caption}</p>
      )}
    </section>
  );
}