/**
 * How long a case study takes to read, measured rather than typed.
 *
 * The number exists to answer one question a reader asks before they commit:
 * "is this a two-minute skim or a fifteen-minute sit-down?" Getting that wrong
 * in either direction costs a read — understate it and they bail halfway,
 * overstate it and they never start.
 *
 * So it is computed from the copy at build time, from the same JSON the page
 * renders, for the same reason the specs and the favicon are generated: a
 * hand-typed "8 min read" is correct exactly once, and nothing tells you the
 * day it stops being true. Rewriting a section moves this automatically.
 *
 * A `.ts` in src/data rather than a component in src/components, deliberately.
 * The component count on /how-this-was-built is computed by counting `.tsx`
 * files and build-code-specs.mjs writes a contract for each one; this is a
 * calculation, not a component, and must move neither number. Same reasoning
 * as analytics.ts and service-marks.ts.
 */

/**
 * Every case study's copy, keyed by module path. Eager, so this resolves at
 * build time and the number is baked into the HTML — a reading time that
 * needed JavaScript to appear would be worse than not having one.
 */
const copyModules = import.meta.glob<Record<string, unknown>>('../copy/*.json', {
  eager: true,
  import: 'default'
});

/**
 * Words per minute.
 *
 * Medium uses 265, which is calibrated to a fairly light read. These studies
 * are dense — rejected alternatives, testing trade-offs, numbers with sources
 * attached — and are read by someone assessing them rather than browsing, which
 * is slower again. 230 is the compromise, and it is the one number here that is
 * a judgement rather than a measurement.
 */
const WORDS_PER_MINUTE = 230;

/**
 * Seconds added per figure.
 *
 * Medium tapers this (12s for the first image, down to 3s); the taper assumes a
 * gallery, where later images are skimmed. Every image in these studies is a
 * screen being argued about in the prose beside it, so it holds attention as
 * long as the first one. A flat 10s, not tapered.
 */
const SECONDS_PER_FIGURE = 10;

/** Editor's note at the top of each copy file. Never rendered, never counted. */
const isEditorNote = (path: string) => path.split('.').includes('_comment');

/**
 * Alt text is not read by a sighted reader, so it is out of the word count.
 * It doubles as the figure count: there is exactly one alt string per image, so
 * the thing that must be excluded from one total is what produces the other.
 */
const isAltText = (path: string) => /(^|\.)(image|media|motionMedia|cover)Alt$/.test(path);

interface Tally {
  words: number;
  figures: number;
}

/** Walks the copy object and tallies leaf strings by what they are. */
function tally(node: unknown, path: string, acc: Tally): Tally {
  if (Array.isArray(node)) {
    node.forEach((child, i) => tally(child, `${path}.${i}`, acc));
    return acc;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      tally(child, path ? `${path}.${key}` : key, acc);
    }
    return acc;
  }
  if (typeof node !== 'string') return acc;

  if (isEditorNote(path)) return acc;
  if (isAltText(path)) {
    acc.figures += 1;
    return acc;
  }
  // A gap marker is a missing fact rendered on the page, not reading material.
  const prose = node.replace(/\[NEEDS:[^\]]*\]/g, ' ');
  acc.words += prose.split(/\s+/).filter(Boolean).length;
  return acc;
}

export interface ReadingTime {
  minutes: number;
  /** "7 min read" — the phrasing readers already know from Medium. */
  label: string;
  /** Kept for the `datetime` attribute, which wants a real duration. */
  words: number;
  figures: number;
}

/**
 * Returns null when there is no copy file for the slug, rather than throwing or
 * rendering a zero. A study without copy has nothing to time, and "0 min read"
 * is worse than silence.
 */
export function readingTime(slug: string): ReadingTime | null {
  const copy = copyModules[`../copy/${slug}.json`];
  if (!copy) return null;

  const { words, figures } = tally(copy, '', { words: 0, figures: 0 });
  if (words === 0) return null;

  const seconds = (words / WORDS_PER_MINUTE) * 60 + figures * SECONDS_PER_FIGURE;
  // Rounded, with a floor of 1: rounding alone turns a short page into "0 min".
  const minutes = Math.max(1, Math.round(seconds / 60));

  return { minutes, label: `${minutes} min read`, words, figures };
}