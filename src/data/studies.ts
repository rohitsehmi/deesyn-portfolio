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
import coverScaling from '../assets/cover-scaling-a-system.png';

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
   * Which brands' sites show this study. Absent means every brand, which is the
   * right default: a study is work, and the brand is only the framing it is
   * being shown under.
   *
   * A LIST rather than a single brand, since 2026-08-17. The first real user of
   * this field needed to appear on two hostnames out of three, which a single
   * value cannot say, and "every brand except one" is a shape that recurs. A
   * one-element list still works and reads the same.
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
  brands?: Brand[];
}

/**
 * Slugs, excluding the `_comment` the copy file carries for whoever opens it.
 * Without the Exclude, every lookup below widens to `string | {…}` and none of
 * the fields resolve — which is the type system correctly pointing out that a
 * documentation key and a content key are sitting in the same object.
 */
type StudySlug = Exclude<keyof typeof copy, '_comment'>;

/** Structure only. Everything a reader sees comes from src/copy/studies.json. */
const order: { slug: StudySlug; coverSrc?: ImageMetadata; archived?: boolean; brands?: Brand[] }[] = [
  { slug: 'machine-readable-components', coverSrc: coverMachineReadable },
  /*
    Shares cover-search-experience.png with the archived study of that name, and
    that is now correct rather than borrowed. The comment here used to call it
    off-subject on the grounds that it depicts search, which was the study this
    one replaced. That stopped being true the moment the two were read as one
    argument: search's material IS this study, so a picture of a results list,
    a detail view, filters and a bar chart is exactly its subject.

    Both entries carry the same alt text, which is right and not duplication to
    tidy away: alt describes the image, and it is one image.

    Still a placeholder in the sense that every cover here is, and a cover of
    its own would be better. It is no longer wrong.
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
    LIVE again 2026-08-17, having been archived on 2026-08-05 for having no
    personal role and no reflection. Both are now written: the contribution is
    taken from the CV rather than from either colleague's account of the same
    programme, and the hindsight is three named costs rather than a summary.

    Cover added 2026-08-17, and it is this study's own rather than borrowed:
    four panels feeding one lit tile feeding four labelled cards, which is the
    argument the page makes. Red, where the other two are violet and sage, so
    the three are told apart at a glance on the index.

    EVERY BRAND, since 2026-09-01, which is why there is no `brands` field
    here at all. It was scoped to the partner hostnames from 2026-08-17 and
    extended to Ticketmaster and Asos on 2026-08-26, on the argument that the
    apex read tighter with one study per discipline and that a third tile there
    would be a second design-system study under the same tag as the first.
    Rohit overruled that: the apex now shows all three.

    ABSENT rather than listing every brand out, and the distinction is the one
    the note below already drew. A list says which brands are OFFERED a study,
    so a brand added later has to be named deliberately instead of inheriting
    one nobody decided to give it. Absent says the study belongs to everybody,
    which is a different claim and the true one here — a sixth brand should get
    this study without anyone remembering to add it.

    Nothing else had to change for it, and that is the mechanism working. The
    hero count is derived from `studiesFor(brand).length`, so the apex reads
    "Three case studies" on its own; the index grid has been capped at two
    columns since 2026-08-17, so the third tile drops underneath rather than
    needing a per-brand track count; and the next-study band groups brands by
    the study they land on. The one thing that DID move is the standfirst's
    `{systems}` token, which now resolves to "Two" on the apex.
  */
  { slug: 'scaling-a-system', coverSrc: coverScaling }
];

export const studies: Study[] = order.map(({ slug, coverSrc, archived, brands }) => {
  const c = copy[slug];
  return {
    slug,
    title: c.title,
    summary: c.summary,
    discipline: c.discipline,
    ...(coverSrc ? { cover: { src: coverSrc, alt: c.coverAlt } } : {}),
    ...(archived ? { archived } : {}),
    ...(brands ? { brands } : {})
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
  liveStudies.filter((s) => !s.brands || s.brands.includes(brand));

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
