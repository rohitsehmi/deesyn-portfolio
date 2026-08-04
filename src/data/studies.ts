/**
 * The case studies, in the order they are shown.
 *
 * One list, so the index and the "next study" link at the foot of each study
 * cannot disagree about what exists. Adding a study here adds it everywhere.
 *
 * Two studies, two disciplines. If both argued the same discipline one of them
 * would be doing no work, which is why the label is on the tile.
 */
export interface Study {
  slug: string;
  title: string;
  summary: string;
  discipline: string;
  /** Draft studies still render; they are just honest about being unfinished. */
  draft?: boolean;
}

export const studies: Study[] = [
  {
    slug: 'machine-readable-components',
    title: 'A component library a machine could read',
    summary: 'Expedia Group had three drifting implementations of every component. We rebuilt them against one written specification that designers, engineers and language models could all build from.',
    discipline: 'Design systems',
    draft: true
  },
  {
    slug: 'search-experience',
    title: 'Search, rebuilt so it could be tested',
    summary: 'The Hotels.com app showed search results in a card framework nothing could be varied inside. Rebuilding it as dynamic cards turned the app\'s most valuable screen into one the team could learn from.',
    discipline: 'Product design',
    draft: true
  }
];

/**
 * Not listed: work/scaling-a-system, the Expedia design system consolidation.
 * It stays in the repo but off the site. Two design-system studies argue one
 * claim, and it is the weaker of the two: 2021-2023, no user testing, and
 * adoption metrics where a reader asks for outcomes.
 */

export const studyPath = (s: Study) => `/work/${s.slug}`;

/** The next study to offer at the foot of one, wrapping at the end. */
export function nextStudy(slug: string): Study | undefined {
  if (studies.length < 2) return undefined;
  const i = studies.findIndex((s) => s.slug === slug);
  return i === -1 ? undefined : studies[(i + 1) % studies.length];
}
