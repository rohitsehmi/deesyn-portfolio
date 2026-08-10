/**
 * The site's primary navigation, in one place.
 *
 * "Work" is deliberately absent: the logo already returns to the index, and a
 * nav item pointing at the page you are on is a wasted slot. Every entry here
 * must resolve to a real page. A nav that 404s is worse than a shorter nav.
 *
 * "About" was removed on 2026-08-05. On a site whose whole argument is two case
 * studies, a page about the person is a third thing competing for a click that
 * should go to the work — and what it would say is already said by the case
 * studies, the CV and the home page standfirst.
 *
 * `src/pages/about.astro` still builds and is still reachable at its URL, the
 * same way an archived case study is. Removing a link is reversible; deleting
 * the page is a decision to make later, once there is a reason to.
 */
export interface NavLink {
  label: string;
  href: string;
  /**
   * The one action the site is for. Renders as a primary button instead of a
   * ghost one, and carries the conic ring on hover and focus.
   *
   * There can only be one. Two ghost links gave Contact exactly the same weight
   * as CV, which means the chrome had no opinion about what it wanted the
   * reader to do — and the whole site exists to start one conversation.
   *
   * Briefly removed on 2026-08-10 and restored the same day. What was actually
   * wrong was the mobile sheet, where `cta` was rendering the link in
   * `fg/accent` — blue display-size text with no pill and no ring around it,
   * which reads as a mis-styled link rather than as emphasis. The desktop
   * treatment was never the problem. The sheet no longer keys off this at all;
   * see Nav.css.
   */
  cta?: boolean;
}

export const navLinks: NavLink[] = [
  { label: 'CV', href: '/cv' },
  { label: 'Contact', href: '/contact', cta: true }
];

/** Marks the current page so the nav can render aria-current. */
export const linksFor = (pathname: string) =>
  navLinks.map((l) => ({ ...l, current: l.href === pathname.replace(/\/$/, '') || undefined }));
