/**
 * Counts the impact metrics up to their real values when they scroll into view.
 *
 * A `.ts` rather than a `.tsx`, deliberately, for the same reason as
 * analytics.ts and service-marks.ts: the component count on /how-this-was-built
 * is computed by counting `.tsx` files in src/components, and
 * build-code-specs.mjs writes a contract for each one. This is behaviour
 * attached to a component, not a component, and must move neither number.
 *
 * Why it is a page script and not part of <Metrics>
 * -------------------------------------------------
 * The number is already correct in the HTML. Metrics renders server-side with
 * no client directive, so a case study currently ships zero JavaScript for it,
 * and the final value is in the markup whether or not this ever runs. That is
 * the whole reason to do it this way round: the animation is an enhancement on
 * top of a correct page, not the thing that produces the number. If the script
 * fails, is blocked, or never loads, a reader sees "+85%" — not "0".
 *
 * Hydrating Metrics with `client:visible` would have been the obvious route and
 * is worse twice over: it ships React to render a number that is already on
 * screen, and it puts a running animation inside every Chromatic snapshot of
 * the component, which is a flake waiting to happen.
 *
 * Should it animate at all
 * ------------------------
 * By the frequency gate in .claude/skills/emil-design-eng: a reader sees this
 * once per case study, which is the "rare" band, and rare is where motion is
 * allowed to be delight rather than feedback. The number is also the single
 * thing the impact section is arguing, so drawing the eye to it is the animation
 * doing a job rather than decorating one.
 */

/** Everything the element needs to animate, worked out once. */
interface Parsed {
  el: HTMLElement;
  /** Text before the digits: "+", "~", a currency symbol. */
  prefix: string;
  /** Text after the digits: "%", "x", "s". */
  suffix: string;
  target: number;
  /** Decimal places in the authored value, so 35.5% never renders as "35". */
  decimals: number;
  /** Whether the authored value grouped thousands, so 1,200 stays 1,200. */
  grouped: boolean;
}

/**
 * Splits "+85%" into "+", 85, "%".
 *
 * Returns null when there is no number to animate, which covers two real cases:
 * a value that is pure text, and a `[NEEDS: …]` gap marker. The gap markers are
 * refused explicitly rather than by luck — `[NEEDS: 3 things]` contains a digit
 * and would otherwise count up to 3, turning a visible reminder into something
 * that looks like a real measurement.
 */
function parse(el: HTMLElement): Parsed | null {
  const raw = (el.textContent ?? '').trim();
  if (!raw || raw.includes('[NEEDS')) return null;

  const m = raw.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
  if (!m) return null;

  const [, prefix, digits, suffix] = m;
  const plain = digits.replace(/,/g, '');
  const target = Number(plain);
  if (!Number.isFinite(target)) return null;

  return {
    el,
    prefix,
    suffix,
    target,
    decimals: (plain.split('.')[1] ?? '').length,
    grouped: digits.includes(',')
  };
}

/** Re-groups thousands, so a value authored as 1,200 counts through 1,050. */
const group = (s: string) => {
  const [whole, frac] = s.split('.');
  const withSeps = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac ? `${withSeps}.${frac}` : withSeps;
};

/**
 * Evaluates a CSS cubic-bezier at x, by Newton-Raphson.
 *
 * Here so the curve can be *read from the token* rather than approximated.
 * `easing/out` is cubic-bezier(0.23, 1, 0.32, 1), and picking something
 * hand-rolled that "looks similar" is exactly the drift the token exists to
 * prevent — the count would ease differently from every other motion on the
 * site while claiming to use the same curve.
 */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number) => 3 * b - 6 * a;
  const C = (a: number) => 3 * a;
  const calc = (t: number, a: number, b: number) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = calc(t, x1, x2) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = slope(t, x1, x2);
      if (d === 0) break;
      t -= err / d;
    }
    return calc(t, y1, y2);
  };
}

/** Reads a custom property off the root, so nothing here is a literal. */
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function easingFromToken(value: string): (x: number) => number {
  const m = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return (x) => x; // `linear`, or anything unparseable
  const n = m[1].split(',').map((v) => Number(v.trim()));
  return n.length === 4 && n.every(Number.isFinite) ? bezier(n[0], n[1], n[2], n[3]) : (x) => x;
}

/**
 * Milliseconds between one tile starting and the next.
 *
 * Inside the 30–80ms band the stagger rules give, at the top of it because
 * these are display-size blocks a long way apart, not list rows. Decorative
 * only: nothing waits on it, and the final values are already on screen.
 */
const STAGGER_MS = 80;

export function tickNumbers(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-ticker]'));
  if (!els.length) return;

  /*
    Reduced motion stops before anything is touched, rather than animating
    faster. The correct number is already rendered, so doing nothing is not a
    degraded experience here — it is the same experience without the movement,
    which is exactly what the setting asks for.
  */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const duration = parseFloat(cssVar('--semantic-duration-counter')) || 0;
  if (!duration) return;
  const ease = easingFromToken(cssVar('--semantic-easing-out'));

  const parsed = new Map<HTMLElement, Parsed>();
  for (const el of els) {
    const p = parse(el);
    // Not parseable is not an error: a text-only metric keeps its text.
    if (p) parsed.set(el, p);
  }
  if (!parsed.size) return;

  const run = (p: Parsed, delay: number) => {
    const start = performance.now() + delay;
    const frame = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const v = p.target * ease(t);
      const text = p.grouped ? group(v.toFixed(p.decimals)) : v.toFixed(p.decimals);
      p.el.textContent = `${p.prefix}${text}${p.suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  /*
    Per grid, so the stagger runs across the tiles a reader is actually looking
    at rather than across every metric on the page. Threshold 0.6: the tiles are
    tall, and starting a count the moment one pixel appears means most of it
    happens below the fold.
  */
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const tiles = Array.from(entry.target.querySelectorAll<HTMLElement>('[data-ticker]'));
        tiles.forEach((el, i) => {
          const p = parsed.get(el);
          if (!p) return;
          // Zero the digits only now. Doing it up front would blank a number
          // that is on screen at load, before the observer has anything to say.
          p.el.textContent = `${p.prefix}${(0).toFixed(p.decimals)}${p.suffix}`;
          run(p, i * STAGGER_MS);
        });
      }
    },
    { threshold: 0.6 }
  );

  const grids = new Set<Element>();
  for (const el of parsed.keys()) {
    const grid = el.closest('.metrics__grid');
    if (grid) grids.add(grid);
  }
  grids.forEach((g) => observer.observe(g));
}