/**
 * Behaviour for <Carousel>: arrows, dots, autoplay.
 *
 * A `.ts` rather than a `.tsx`, deliberately, for the same reason as
 * number-ticker.ts, analytics.ts and service-marks.ts: the component count on
 * /how-this-was-built counts `.tsx` files in src/components and
 * build-code-specs.mjs writes a contract for each one. This is behaviour
 * attached to a component, not a component, and must move neither number.
 *
 * Why a page script and not `client:visible`
 * ------------------------------------------
 * The gallery is already complete in the HTML. Carousel renders server-side
 * with no client directive, and the track is a scroll-snap container, so with
 * the script blocked a reader still gets every screen, swipeable on a phone and
 * scrollable with the keyboard. Hydrating would ship React to add three
 * buttons to a list of images that already works.
 *
 * What autoplay has to respect
 * ----------------------------
 * Auto-advancing content that a reader did not ask for is the most commonly
 * botched pattern on the web, so the rules here are strict and none of them are
 * optional:
 *
 *  - `prefers-reduced-motion: reduce` disables autoplay outright. Not slowed,
 *    not shortened. Someone who has asked the OS to stop moving things has
 *    asked for this too.
 *  - Any deliberate input stops it for good. WCAG 2.2.2 requires a mechanism to
 *    pause moving content, and the honest reading is that once a reader takes
 *    control the carousel should never take it back. Pressing an arrow to look
 *    at something, only for it to slide away three seconds later, is the exact
 *    failure the criterion exists to prevent.
 *  - Focus pauses it and hover does not. That asymmetry was measured rather
 *    than assumed — see the note on the focusin listener below.
 *  - Off-screen pauses it, so a gallery halfway down a case study is not
 *    cycling to nobody.
 */

const REDUCED = '(prefers-reduced-motion: reduce)';

function initOne(root: HTMLElement) {
  if (root.dataset.enhanced) return;

  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]')];
  const label = root.querySelector<HTMLElement>('[data-carousel-label]');
  if (!track) return;

  const slides = [...track.children] as HTMLElement[];
  if (slides.length < 2) return;

  /* Labels live on the slides so the script has one source for them, rather
     than a second list in JavaScript that can drift from the markup. */
  const labels = slides.map((s) => s.querySelector('img')?.dataset.label ?? '');

  const reduced = window.matchMedia(REDUCED);
  const autoplayMs = Number(root.dataset.autoplayMs ?? 0);

  /*
    A clone of the first slide, appended so the gallery can loop forwards
    instead of rewinding.

    Wrapping by scrolling from the last slide back to the first drags the whole
    track past the reader in reverse, which reads as the thing breaking rather
    than repeating. Advancing into a copy of slide one and then silently
    resetting the scroll position to the real slide one is the same pixels
    either side of the swap, so there is nothing to see.

    Built here rather than in the markup on purpose: without the script there is
    no autoplay to wrap, and a duplicate slide in the HTML would be a duplicate
    slide for everyone. It is aria-hidden, so the count a screen reader
    announces stays "3 of 3".
  */
  const clone = slides[0].cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('aria-roledescription');
  clone.removeAttribute('aria-label');
  clone.dataset.carouselClone = 'true';
  track.appendChild(clone);

  let index = 0;
  let timer: number | undefined;
  /* Once true, autoplay never restarts for the life of the page. */
  let surrendered = false;
  let visible = false;
  /*
    True while the track is moving because we told it to, rather than because
    the reader dragged it.

    The scroll listener derives the current slide from the live scroll offset,
    which is correct for a swipe and wrong for a click: for the first ~100ms of
    a smooth scroll the track is still sitting on the old slide, so the listener
    would overwrite the index the click had just set and the dots and label
    would run 1 -> 0 -> 1. Measured before this flag existed: two changes per
    click, the label visibly flicking back to the previous slide's.
  */
  let programmatic = false;

  const left = (n: HTMLElement) => n.offsetLeft - track.offsetLeft;
  const scrollTo = (x: number, smooth: boolean) =>
    track.scrollTo({ left: x, behavior: smooth && !reduced.matches ? 'smooth' : 'auto' });

  /* Owns the paint, so no caller has to remember to. Two callers painting was
     the other half of the flicker. */
  const go = (to: number, smooth = true) => {
    index = (to + slides.length) % slides.length;
    programmatic = true;
    scrollTo(left(slides[index]), smooth);
    paint();
    onSettle(() => { programmatic = false; });
  };

  /** Runs once the smooth scroll has come to rest. */
  const onSettle = (fn: () => void) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      track.removeEventListener('scrollend', finish);
      fn();
    };
    // scrollend is not in every browser yet, so the timeout is the real
    // guarantee and the event is the fast path.
    track.addEventListener('scrollend', finish);
    window.setTimeout(finish, 900);
  };

  /** Forward by one, looping through the clone rather than rewinding. */
  const advance = () => {
    if (index < slides.length - 1) { go(index + 1); return; }
    programmatic = true;
    scrollTo(left(clone), true);
    index = 0;
    paint();
    onSettle(() => { scrollTo(0, false); programmatic = false; });
  };

  const paint = () => {
    dots.forEach((d, i) => {
      if (i === index) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    if (label && labels[index]) label.textContent = labels[index];
  };

  const stop = () => {
    if (timer !== undefined) { window.clearInterval(timer); timer = undefined; }
  };

  const start = () => {
    stop();
    if (surrendered || !autoplayMs || reduced.matches || !visible) return;
    timer = window.setInterval(advance, autoplayMs);
  };

  /** Deliberate input. Hand the carousel over and do not take it back. */
  const surrender = () => { surrendered = true; stop(); };

  /* Read the index back off the scroll position rather than trusting the last
     value written. A swipe moves the track without going through go(), and the
     dots have to follow the thing the reader actually did. */
  let frame = 0;
  track.addEventListener('scroll', () => {
    if (frame || programmatic) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(left(s) + s.clientWidth / 2 - mid);
        if (d < best) { best = d; nearest = i; }
      });
      if (nearest !== index) { index = nearest; paint(); }
    });
  }, { passive: true });

  prev?.addEventListener('click', () => {
    surrender();
    /* Backwards off the first slide is the one move with no clone to hide it,
       so it jumps rather than dragging the whole track past in reverse. A
       deliberate press landing instantly reads as a jump; the same distance
       animated reads as a fault. */
    if (index === 0) go(slides.length - 1, false);
    else go(index - 1);
  });
  next?.addEventListener('click', () => { surrender(); advance(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { surrender(); go(i); }));

  /* A swipe or a keyboard scroll is input too, even though it never reaches a
     button. pointerdown rather than a scroll listener, because autoplay's own
     movement fires scroll and would otherwise switch itself off. */
  track.addEventListener('pointerdown', () => {
    surrender();
    /* A hand on the track outranks a scroll we started. Without this, a swipe
       landing inside the settle window would move the track with the dots
       frozen, because the listener would still be suppressed. */
    programmatic = false;
  }, { passive: true });
  track.addEventListener('keydown', surrender);

  /*
    Focus pauses it, hover does not — and that asymmetry was measured, not
    assumed. The stage fills most of the reading column, so a mouse resting
    anywhere near the text sat inside the carousel and held autoplay at slide
    one indefinitely: 0 -> 0 over eleven seconds with the pointer parked on it,
    against 0 -> 2 with the pointer away. A feature that only runs when the
    cursor is somewhere else looks broken, and reads as broken.

    Focus is different. It means someone is working through this with a keyboard
    or a screen reader, and moving the content under them is the failure.
  */
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', (e) => {
    if (root.contains(e.relatedTarget as Node)) return;
    start();
  });

  new IntersectionObserver(
    (entries) => {
      for (const e of entries) { visible = e.isIntersecting; }
      if (visible) start(); else stop();
    },
    { threshold: 0.4 }
  ).observe(root);

  /* Someone can turn reduced motion on while the page is open. */
  reduced.addEventListener('change', () => { if (reduced.matches) stop(); else start(); });

  root.dataset.enhanced = 'true';
  paint();
}

export function initCarousels(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-carousel]').forEach(initOne);
}