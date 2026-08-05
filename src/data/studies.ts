/**
 * The case studies, in the order they are shown.
 *
 * One list, so the index and the "next study" link at the foot of each study
 * cannot disagree about what exists. Adding a study here adds it everywhere.
 *
 * NOTHING IS EVER DELETED FROM HERE. To take a study off the site, set
 * `archived: true`: the page keeps building and stays reachable at its URL, it
 * just leaves the index and the next-study rotation. Which studies make the
 * final cut is a content decision to be made once all the material exists, and
 * deleting an entry removes the option before then.
 *
 * Structure lives here; the words live in src/copy/studies.json, keyed by the
 * same slug, so the tile copy is editable in the browser like everything else.
 * The split is the same one the rest of the site makes: this file decides what
 * exists and in what order, that file decides what it says.
 */
import copy from '../copy/studies.json';
import coverMachineReadable from '../assets/cover-machine-readable-components.png';
import coverSearch from '../assets/cover-search-experience.png';

export interface Study {
  slug: string;
  title: string;
  summary: string;
  /**
   * Index tile cover. Abstract by intent — it sets a tone and distinguishes one
   * study from the other at a glance. It is not evidence and must never be
   * mistaken for a screenshot of the work.
   */
  cover?: { src: ImageMetadata; alt: string };
  /**
   * The discipline this study argues for. Two studies arguing one discipline
   * means one of them is doing no work, which is visible on the index because
   * the label sits on the tile.
   */
  discipline: string;
  /** Off the index and the next-study rotation, still built, still reachable. */
  archived?: boolean;
}

/**
 * Slugs, excluding the `_comment` the copy file carries for whoever opens it.
 * Without the Exclude, every lookup below widens to `string | {…}` and none of
 * the fields resolve — which is the type system correctly pointing out that a
 * documentation key and a content key are sitting in the same object.
 */
type StudySlug = Exclude<keyof typeof copy, '_comment'>;

/** Structure only. Everything a reader sees comes from src/copy/studies.json. */
const order: { slug: StudySlug; coverSrc?: ImageMetadata; archived?: boolean }[] = [
  { slug: 'machine-readable-components', coverSrc: coverMachineReadable },
  { slug: 'search-experience', coverSrc: coverSearch },
  /*
    Archived 2026-08-05. A reader asks for one to two flows, and this is the
    weaker of the two design-system studies: no user testing anywhere, and
    adoption figures where a reader asks for outcomes. It is also 2021-2023
    against a reader that says "recent".

    Not deleted. It still builds, is still reachable at /work/scaling-a-system,
    and can come back by removing one line.
  */
  { slug: 'scaling-a-system', archived: true }
];

export const studies: Study[] = order.map(({ slug, coverSrc, archived }) => {
  const c = copy[slug];
  return {
    slug,
    title: c.title,
    summary: c.summary,
    discipline: c.discipline,
    ...(coverSrc ? { cover: { src: coverSrc, alt: c.coverAlt } } : {}),
    ...(archived ? { archived } : {})
  };
});

/** What the site shows. Archived studies stay in the list above. */
export const liveStudies = studies.filter((s) => !s.archived);

export const studyPath = (s: Study) => `/work/${s.slug}`;

/** `<file>:<path>` base for the tile copy, so a tile can be edited in place. */
export const studyCopyBase = (s: Study) => `studies:${s.slug}`;

/**
 * The next study to offer at the foot of one, wrapping at the end.
 *
 * Rotates through live studies only, and returns nothing when the current study
 * is archived or is the only one left, so an archived page never advertises
 * itself and a lone study never links to itself.
 */
export function nextStudy(slug: string): Study | undefined {
  if (liveStudies.length < 2) return undefined;
  const i = liveStudies.findIndex((s) => s.slug === slug);
  return i === -1 ? undefined : liveStudies[(i + 1) % liveStudies.length];
}
