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
import { BRANDS, DEFAULT_BRAND, type Brand } from './brands';
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
  /**
   * Which brand's site shows this study. Absent means every brand, which is the
   * right default: a study is work, and the brand is only the framing it is
   * being shown under.
   *
   * BUILD-TIME LISTS, RUNTIME BRAND. One build serves every hostname, so this
   * cannot remove a study from the HTML — the index renders every live tile and
   * marks the brand-specific ones `data-brand-only`, and CSS hides the ones
   * that do not belong to the hostname being read. The page itself is
   * prerendered at its URL on every host and stays reachable there.
   *
   * So this decides what a brand is OFFERED, not what it could reach by typing
   * an address. That is the same isolation-by-routing limit the rest of the
   * multi-brand work has, and it is fine while the brands are different
   * framings of the same work. It stops being fine the day one holds another
   * client's material, and no amount of gating here would fix that — it needs
   * separate builds.
   */
  brand?: Brand;
}

/**
 * Slugs, excluding the `_comment` the copy file carries for whoever opens it.
 * Without the Exclude, every lookup below widens to `string | {…}` and none of
 * the fields resolve — which is the type system correctly pointing out that a
 * documentation key and a content key are sitting in the same object.
 */
type StudySlug = Exclude<keyof typeof copy, '_comment'>;

/** Structure only. Everything a reader sees comes from src/copy/studies.json. */
const order: { slug: StudySlug; coverSrc?: ImageMetadata; archived?: boolean; brand?: Brand }[] = [
  { slug: 'machine-readable-components', coverSrc: coverMachineReadable },
  /*
    Borrowing the search cover, deliberately and temporarily. Every cover on the
    site is a placeholder, and this one is off-subject on top of that: it draws
    a search field over a list of results, which is the study this one replaced.
    It is here so the index does not render one tile with an image beside one
    without, which reads as a build error rather than as a draft. Replace it
    with this study's own before anything is sent.
  */
  { slug: 'making-the-app-testable', coverSrc: coverSearch },
  /*
    Archived 2026-08-06, and then absorbed rather than shelved.

    It was first swapped out for `contextual-home`, on the grounds that the
    measured results on rohitsehmi.com/apps belong to the home work and search's
    own are recorded only directionally. That trade cost the better flow story
    to get the harder numbers, and it left the replacement with an empty
    explorations section.

    Both problems went away when the two were read as one argument: the home and
    the results page were both rebuilt to make testing possible, and the
    standing test programme is what ran through them. That study is
    `making-the-app-testable`, and search's material — the dynamic card
    framework, the three adaptive layouts, the recap test that lost and was
    retested — is in it.

    Kept here because its own page still holds the longer version, including the
    2025 App Shell motion work, which the merged study leaves out. Not deleted.
  */
  { slug: 'search-experience', coverSrc: coverSearch, archived: true },
  /*
    Archived 2026-08-05. Two design-system studies is one too many, and this is
    the weaker of them: no user testing anywhere, and adoption figures where it
    needed outcomes. It is also the older of the two.

    Not deleted. It still builds, is still reachable at /work/scaling-a-system,
    and can come back by removing one line.
  */
  { slug: 'scaling-a-system', archived: true },
  /*
    PLACEHOLDER, added 2026-08-14, and Wise only.

    It is here to prove the brand mechanism carries a whole entity rather than
    the spans and link lists it has held so far: a study that appears on the
    index, enters the rotation and takes a page, on one hostname and not the
    other. Its copy says as much on the page, in place of the work it is
    standing in for — a placeholder that reads like a real study is a lie
    waiting for someone to quote it.

    Delete this entry and its two copy files when the real Wise study lands, or
    rename the slug and write over them. It is the one thing here that IS safe
    to delete, because the rule above protects a record of real work and there
    is none in this.
  */
  { slug: 'wise-placeholder', brand: 'wise' }
];

export const studies: Study[] = order.map(({ slug, coverSrc, archived, brand }) => {
  const c = copy[slug];
  return {
    slug,
    title: c.title,
    summary: c.summary,
    discipline: c.discipline,
    ...(coverSrc ? { cover: { src: coverSrc, alt: c.coverAlt } } : {}),
    ...(archived ? { archived } : {}),
    ...(brand ? { brand } : {})
  };
});

/**
 * What the site shows, across every brand. Archived studies stay in the list
 * above.
 *
 * This is what the index iterates, and it has to be: one build serves every
 * hostname, so every live tile ships in the HTML and CSS hides the ones that do
 * not belong to the brand being read. Use `studiesFor` to ask what one brand is
 * offered.
 */
export const liveStudies = studies.filter((s) => !s.archived);

/** The live studies one brand is offered, in order. */
export const studiesFor = (brand: Brand): Study[] =>
  liveStudies.filter((s) => !s.brand || s.brand === brand);

export const studyPath = (s: Study) => `/work/${s.slug}`;

/** `<file>:<path>` base for the tile copy, so a tile can be edited in place. */
export const studyCopyBase = (s: Study) => `studies:${s.slug}`;

/**
 * The next study to offer at the foot of one, wrapping at the end.
 *
 * Rotates through the live studies THIS BRAND is offered, so the foot of a page
 * never points at a study the reader's hostname does not show. Every brand gets
 * its own answer for the same page, and the layout renders all of them and lets
 * CSS pick — see src/layouts/CaseStudy.astro.
 *
 * Returns nothing when the study is archived or when the brand has fewer than
 * two, so an archived page never advertises itself and a lone study never links
 * to itself.
 *
 * The one case that needs explaining is a live study belonging to ANOTHER
 * brand, which is reachable here because every page is prerendered on every
 * host. It is not in this brand's rotation, so there is no "next" in the
 * sequence sense; it offers the brand's first study instead. Returning nothing
 * would be the tidier-looking answer and is worse in both directions: it
 * strands a reader who followed a link with no way back into the work, and it
 * makes the presence of the next-study band differ by brand on one page, which
 * is a band-adjacency question CSS cannot answer — see the footer role in the
 * layout.
 */
export function nextStudy(slug: string, brand: Brand = DEFAULT_BRAND): Study | undefined {
  const live = studiesFor(brand);
  if (live.length < 2) return undefined;

  const i = live.findIndex((s) => s.slug === slug);
  if (i !== -1) return live[(i + 1) % live.length];

  const study = studies.find((s) => s.slug === slug);
  if (!study || study.archived) return undefined;
  return live[0];
}

/**
 * Every brand's answer for one page, for a layout that has to render all of
 * them and gate them.
 */
export const nextStudyByBrand = (slug: string) =>
  BRANDS.map((brand) => ({ brand, study: nextStudy(slug, brand) }));
