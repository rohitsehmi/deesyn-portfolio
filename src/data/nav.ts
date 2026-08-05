/**
 * The site's primary navigation, in one place.
 *
 * "Work" is deliberately absent: the logo already returns to the index, and a
 * nav item pointing at the page you are on is a wasted slot. Every entry here
 * must resolve to a real page. A nav that 404s is worse than a shorter nav.
 */
export interface NavLink {
  label: string;
  href: string;
  /**
   * The one action the site is for. Renders as a primary button instead of a
   * ghost one.
   *
   * There can only be one. Three ghost links gave Contact exactly the same
   * weight as CV, which means the page had no opinion about what it wanted the
   * reader to do — and the whole site exists to start one conversation. A
   * second `cta` would put the hierarchy straight back where it was.
   */
  cta?: boolean;
}

export const navLinks: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'CV', href: '/cv' },
  { label: 'Contact', href: '/contact', cta: true }
];

/** Marks the current page so the nav can render aria-current. */
export const linksFor = (pathname: string) =>
  navLinks.map((l) => ({ ...l, current: l.href === pathname.replace(/\/$/, '') || undefined }));
