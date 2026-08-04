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
 */
export interface Study {
  slug: string;
  title: string;
  summary: string;
  /**
   * The discipline this study argues for. Two studies arguing one discipline
   * means one of them is doing no work, which is visible on the index because
   * the label sits on the tile.
   */
  discipline: string;
  /** Off the index and the next-study rotation, still built, still reachable. */
  archived?: boolean;
}

export const studies: Study[] = [
  {
    slug: 'machine-readable-components',
    title: 'A component library a machine could read',
    summary: 'Expedia Group had three drifting implementations of every component. We rebuilt them against one written specification that designers, engineers and language models could all build from.',
    discipline: 'Design systems'
  },
  {
    slug: 'search-experience',
    title: 'Search, rebuilt so it could be tested',
    summary: 'The Hotels.com app showed search results in a card framework nothing could be varied inside. Rebuilding it as dynamic cards turned the app\'s most valuable screen into one the team could learn from.',
    discipline: 'Product design'
  },
  {
    slug: 'scaling-a-system',
    title: 'Consolidating four design systems into one',
    summary: 'A brand consolidation meant collapsing several independent design systems into a single platform, without flattening the brands that depended on them.',
    discipline: 'Design systems'
  }
];

/** What the site shows. Archived studies stay in the list above. */
export const liveStudies = studies.filter((s) => !s.archived);

export const studyPath = (s: Study) => `/work/${s.slug}`;

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
