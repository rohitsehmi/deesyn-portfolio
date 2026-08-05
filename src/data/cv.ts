/**
 * The CV, as data.
 *
 * One source, same reasoning as `studies.ts`: the page and the PDF describe the
 * same career, and prose that restates a list is the first thing to drift. The
 * PDF is the artefact someone downloads; this is what the page renders. Keep
 * them in step by hand — the PDF is authored in a design tool, so nothing here
 * can check it.
 *
 * Roles with no bullets are deliberate. The early ones earn a line each and no
 * more; a CV that gives 2007 the same space as 2021 is not a CV, it is a log.
 */
export interface Role {
  company: string;
  title: string;
  /** Written out rather than parsed. Ranges here are display strings, not dates. */
  dates: string;
  location: string;
  /** Omitted entirely for the early roles. */
  points?: string[];
}

export const roles: Role[] = [
  {
    company: 'Expedia Group',
    title: 'Senior Design Systems Designer',
    dates: 'May 2021 – March 2026',
    location: 'London',
    points: [
      'Most recently worked on the architecture of a machine-readable component library — components with slots, built on Figma’s current feature set, across every brand in the Expedia Design System Group.',
      'Evolved component frameworks, introducing structure and theme-based solutions serving around 90 brands at scale.',
      'Partnered with motion specialists to design and implement app shell transition patterns within the product experience.',
      'Defined cross-platform layout foundations, establishing scalable spacing and structural standards.',
      'Managed design token synchronisation pipelines across platform repositories.',
      'Enabled governance and contribution models so product teams could extend the system safely.'
    ]
  },
  {
    company: 'Hotels.com',
    title: 'Senior Product Designer',
    dates: 'April 2014 – May 2021',
    location: 'London',
    points: [
      'Led brand experience initiatives across mobile products and platforms.',
      'Established cross-platform design language standards supporting consistency.',
      'Contributed to award-winning mobile experiences, including a Google Play Editors’ Choice.',
      'Drove innovation across key customer journeys including keyless entry, voice UI, wearables and TV.',
      'Supported MVP optimisation initiatives focused on customer experience and conversion.'
    ]
  },
  {
    company: 'Betfair',
    title: 'Mobile Visual Designer',
    dates: 'August 2012 – April 2014',
    location: 'London',
    points: [
      'Owned app design across multiple mobile products, including Casino, Poker and Sports.',
      'Delivered a large-scale rebrand with external agencies, defining design standards that improved consistency across the portfolio.'
    ]
  },
  { company: 'Viasat (MTG)', title: 'Senior Designer', dates: 'April 2009 – August 2012', location: 'London' },
  { company: 'Novarising', title: 'TV Interface Designer', dates: 'February 2009 – April 2009', location: 'London' },
  { company: 'Chellomedia (UPC)', title: 'Interactive TV Designer', dates: 'August 2007 – December 2008', location: 'London' }
];

/**
 * Grouped rather than one long row. Thirteen tags in a single wrap read as a
 * keyword dump; three named groups say what kind of designer this is.
 */
export const skills: { group: string; items: string[] }[] = [
  { group: 'Systems', items: ['Design systems', 'Component libraries', 'Design tokens', 'Figma / Variables', 'Code Connect'] },
  { group: 'Product', items: ['UI / UX design', 'Prototyping', 'Branding', 'Dev handoff'] },
  { group: 'Practice', items: ['WCAG / accessibility', 'Chromatic / Storybook', 'GitHub', 'AI design tools'] }
];

export const education = {
  institution: 'Southampton Solent University',
  dates: '2002 – 2005',
  detail: 'BA (Hons) Graphic Image Making, 2:1'
};

export const awards = [
  { name: 'Google Play Editors’ Choice', dates: 'June 2016', detail: 'Hotels.com Android app' }
];

/**
 * The downloadable artefact. Lives in public/ rather than src/assets/ because
 * it is handed over whole — there is no build step that improves a PDF, and the
 * filename is what lands in someone's downloads folder, so it carries a name
 * that still means something out of context.
 */
export const cvPdf = {
  href: '/Rohit-Sehmi-CV-2026.pdf',
  filename: 'Rohit-Sehmi-CV-2026.pdf',
  /** Shown beside the button. A download with an unknown size is a small rudeness. */
  size: '1.2 MB',
  /**
   * Shown too, because the one thing a reader cannot tell about a CV file is
   * whether it is the current one. Bump it by hand when the PDF is replaced —
   * a build date would say when the site deployed, which is a different fact
   * and a misleading one.
   */
  updated: 'August 2026'
};