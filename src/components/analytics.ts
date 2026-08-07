/**
 * The two custom events worth having, and nothing else.
 *
 * Page views come free from `<Analytics />` in Base.astro and answer "did they
 * open it" and "which study did they read". They do not answer the two things
 * that actually matter for a portfolio: whether anyone reached the end of a
 * case study, and whether anyone opened the artefacts it points at. Those are
 * the events below.
 *
 * A `.ts` rather than a `.tsx`, deliberately, for the same reason as
 * service-marks.ts: the component count on /how-this-was-built is computed by
 * counting `.tsx` files, and `design/build-code-specs.mjs` writes a contract
 * for each one. Analytics is plumbing, not a component, and must move neither
 * number.
 *
 * `track` no-ops unless Vercel Web Analytics is enabled on the project, and it
 * logs to the console rather than sending anything in development — so none of
 * this needs guarding by environment.
 */
import { track } from '@vercel/analytics';

/**
 * Which artefact someone opened from "The receipts".
 *
 * The page argues that the work is inspectable; this measures whether anyone
 * took it up on that. Attached by delegation on the document rather than one
 * listener per link, so it survives the list changing length.
 */
export function trackReceipts(): void {
  document.addEventListener('click', (e) => {
    const link = (e.target as Element | null)?.closest<HTMLElement>('[data-receipt]');
    if (!link) return;
    track('receipt_open', { artefact: link.dataset.receipt ?? 'unknown' });
  });
}

/**
 * Whether a case study was actually read to the end.
 *
 * Fires once, when the impact section has been on screen for three seconds —
 * not on first intersection. Scrolling past something is not reading it, and a
 * fire-on-touch event would report a fast scroll to the footer as a full read,
 * which is the exact flattery this is meant to avoid measuring.
 *
 * Impact rather than hindsight, because hindsight is the last block on the page
 * and sits above the footer: anyone who scrolls to the bottom for any reason
 * passes through it.
 */
export function trackReadDepth(): void {
  const target = document.querySelector<HTMLElement>('[data-read-depth]');
  if (!target) return;
  // Read off the DOM rather than passed in. An Astro <script> has no access to
  // frontmatter, and `define:vars` would force this inline instead of letting
  // it bundle with everything else.
  const slug = target.dataset.readDepth || 'unknown';

  let fired = false;
  let timer: number | undefined;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !fired) {
          timer = window.setTimeout(() => {
            fired = true;
            observer.disconnect();
            track('study_read', { study: slug });
          }, 3000);
        } else if (!entry.isIntersecting && timer) {
          window.clearTimeout(timer);
          timer = undefined;
        }
      }
    },
    { threshold: 0.4 }
  );

  observer.observe(target);
}