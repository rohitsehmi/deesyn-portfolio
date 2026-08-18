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

/**
 * The links in the footer's bottom row.
 *
 * The first is contextual: Footer swaps it for "Back to the work" when you are
 * already on it, so the slot is never spent pointing at the page you are
 * reading. The rest are constant.
 *
 * The bar for adding one is the same as the nav's, and it is written here
 * rather than left implicit: it has to go somewhere the reader cannot get to
 * otherwise. A second affordance for an intent already served — a mailto when
 * Contact is in the nav — is a wasted slot, not a convenience.
 *
 * EGDS 2025 is an easter egg, in the same spirit as /how-this-was-built: not
 * announced anywhere, worth finding. It is a FigJam board rather than part of
 * the site, so it opens in a new tab and its accessible name says so.
 */
export interface FooterLink {
  label: string;
  href: string;
  /** Off-site. Opens in a new tab, and the accessible name is suffixed. */
  external?: boolean;
}

export const footerLinks: FooterLink[] = [
  { label: 'How this was built', href: '/how-this-was-built' },
  {
    label: '2025 FigJam Board',
    href: 'https://www.figma.com/board/GEj8lyjwzQCmvjmdDDghzh/EGDS---2025',
    external: true
  }
];

/** Appended to an external link's accessible name. Matches /how-this-was-built. */
export const NEW_TAB = 'opens in a new tab';
