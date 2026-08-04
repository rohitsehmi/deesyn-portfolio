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
}

export const navLinks: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'CV', href: '/cv' },
  { label: 'Contact', href: '/contact' }
];

/** Marks the current page so the nav can render aria-current. */
export const linksFor = (pathname: string) =>
  navLinks.map((l) => ({ ...l, current: l.href === pathname.replace(/\/$/, '') || undefined }));
