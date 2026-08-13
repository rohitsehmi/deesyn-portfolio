import './Media.css';
/**
 * `natural` keeps the image's own proportions instead of cropping to a frame.
 *
 * Every other value crops — the frame sets an `aspect-ratio` and the image is
 * `object-fit: cover`, which is right for photography and wrong for anything
 * carrying text. A UI capture or an annotated comparison puts its title at the
 * top and its figures along the bottom, and those are precisely the pixels a
 * cover crop removes. Letterboxing them instead would be no better; the frame
 * just takes the height the picture has.
 */
export type MediaRatio = '16-9' | '4-3' | '1-1' | '3-4' | 'natural';

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
  /**
   * The dark-theme counterpart, when the artwork has one.
   *
   * Optional and rare by design. "Bands are relative, media is absolute" —
   * a photograph does not change with the theme, and most images here are
   * photographs or captures whose own background is part of the picture. This
   * exists for the exception: artwork exported from Figma that carries the
   * theme in its own fills, where shipping only the light version puts a white
   * plate in the middle of a dark page.
   *
   * Supplying it renders BOTH images and lets CSS choose, rather than a
   * `<picture>` with `media="(prefers-color-scheme: dark)"`. That looks like
   * the tidier answer and is wrong here: a `<picture>` media query reads the
   * OS setting and cannot see `[data-theme]`, so a reader who used the theme
   * toggle would keep the other theme's image. The CSS below matches the
   * cascade in tokens.css exactly — system preference until an explicit choice
   * exists, then the choice wins.
   */
  srcDark?: string;
  /** Responsive candidates for `srcDark`. Ignored unless `srcDark` is set. */
  srcSetDark?: string;
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
export function Media({ src, srcSet, srcDark, srcSetDark, sizes, alt, ratio = '16-9', fit = 'inset', caption, captionCopyRef }: MediaProps) {
  return (
    <figure className="media" data-ratio={ratio} data-fit={fit}>
      <div className="media__frame">
        {src ? (
          <>
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt={alt}
              loading="lazy"
              decoding="async"
              data-theme-img={srcDark ? 'light' : undefined}
            />
            {/*
              One alt, carried by whichever image is showing. The hidden one is
              `display: none`, which assistive technology skips, so the figure
              is announced once rather than twice — the same reason ThemeToggle
              renders both its icons and hides one instead of swapping a src.

              THE PAIR CAN COST TWO DOWNLOADS. Measured in a real build on
              Chrome, scrolled to the figure, no toggling: with the OS set to
              dark only the dark image was fetched, but with the OS set to
              light BOTH were. `loading="lazy"` defers a `display: none` image
              often enough to look like a rule and not often enough to be one,
              so assume the reader pays for both.

              That is the reason this prop is the exception rather than the
              default. Use it only where the artwork carries the theme in its
              own fills and the light version would otherwise sit on a dark
              page as a white plate.
            */}
            {srcDark && (
              <img
                src={srcDark}
                srcSet={srcSetDark}
                sizes={sizes}
                alt={alt}
                loading="lazy"
                decoding="async"
                data-theme-img="dark"
              />
            )}
          </>
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
