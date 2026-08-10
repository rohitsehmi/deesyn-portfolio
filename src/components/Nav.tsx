import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { IconButton } from './IconButton';
import './Nav.css';

export interface NavProps {
  links?: { label: string; href: string; current?: boolean; cta?: boolean }[];
  actions?: ReactNode;
  /** top is transparent and sits over the band; scrolled takes the canvas. */
  state?: 'top' | 'scrolled';
  /**
   * Code-only prop, with no Figma counterpart: sticking is a scroll behaviour
   * and Figma has no scroll position. When set, the nav pins to the top and
   * drives its own state, so `state` becomes the value before the first scroll.
   */
  sticky?: boolean;
  /**
   * Set when the nav floats over a full-bleed image before it scrolls.
   *
   * At `state=top` the nav is transparent, so it needs the foreground of what
   * is beneath it. It sits outside the band stack and cannot inherit that, so
   * over a dark hero it would otherwise render dark text on a dark image.
   *
   * Absolute rather than a band role, for the same reason the hero itself is:
   * a photograph does not flip with the theme, so a relative role would send
   * the nav the wrong way in one of them.
   *
   * Takes the image's tonality, which must match the `tone` on the media it
   * floats over — `true` is shorthand for the dark default. They are two
   * components reading one property of one image, and nothing but a person
   * looking at the picture can tell them what it is.
   *
   * Dropped the moment it scrolls, because a scrolled nav takes bg/canvas and
   * needs the page's own foreground again.
   */
  onMedia?: boolean | 'dark' | 'light';
}

/**
 * `state=top` is transparent on purpose — it sits over whatever band is beneath
 * it and inherits that band's foreground for free. `state=scrolled` takes
 * bg/canvas plus a 1px hairline. Never a shadow: revolut.com has zero
 * box-shadow, and the colour step is the divider.
 *
 * Nav links are ghost buttons — real hit area, real press feedback.
 */
export function Nav({ links = [], actions, state = 'top', sticky = false, onMedia = false }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /*
    Everything a native sheet does and a div does not.

    Scroll lock: without it the page scrolls under the panel, which on iOS also
    drags the URL bar around. `position: fixed` on the body is the heavier fix
    and loses scroll position; `overflow: hidden` is enough here because the
    panel itself is the full viewport and does not scroll.

    Escape closes, and focus returns to the button that opened it — otherwise
    focus is left orphaned on a hidden element and the next Tab starts from the
    top of the document.

    The resize listener matters more than it looks: open the menu on a phone,
    rotate to landscape past 768px, and the panel is hidden by media query while
    the scroll lock stays applied. The page would be frozen with nothing on
    screen to explain why.
  */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    /*
      Make the rest of the page inert, so `aria-modal="true"` is true.

      Without this the sheet announced itself as modal and was not: tabbing past
      the last link walked straight out into the page behind the scrim — both
      case-study tiles, the footer link, the skip link, and worst of all the
      theme toggle, which is opacity:0 and pointer-events:none while the sheet
      is open. A keyboard user could land on a control they could neither see
      nor click. Found by a WCAG pass on 2026-08-10; axe reports nothing here,
      because nothing in the markup is wrong on its own.

      It walks up from the panel inerting every sibling on the way, rather than
      inerting a fixed list of elements: the panel sits inside an <astro-island>
      alongside the header, so "everything except this subtree" is the only
      description that stays true if the markup around it changes.

      Elements already inert are left alone and not restored, or closing the
      sheet would wake up something that was deliberately asleep.
    */
    const madeInert: HTMLElement[] = [];
    let node: HTMLElement | null = panelRef.current;
    while (node && node !== document.body && node.parentElement) {
      for (const sibling of Array.from(node.parentElement.children)) {
        if (sibling === node || !(sibling instanceof HTMLElement)) continue;
        if (sibling.hasAttribute('inert')) continue;
        sibling.setAttribute('inert', '');
        madeInert.push(sibling);
      }
      node = node.parentElement;
    }

    // Focus the panel itself rather than the first link: announcing "Contact"
    // with no context is disorienting, and the panel carries the accessible name.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      // Before the focus call below, or the trigger is still inert and refuses it.
      for (const el of madeInert) el.removeAttribute('inert');
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!sticky) return;
    // Threshold rather than zero: at exactly 0 a rubber-band scroll on iOS
    // flickers the background on and off.
    const read = () => setScrolled(window.scrollY > 8);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [sticky]);

  const resolved = sticky ? (scrolled ? 'scrolled' : 'top') : state;

  return (
    <>
    {/*
      Fixed, not sticky. A sticky element stays in the document flow, so when
      the browser rubber-bands past the top of the page the header travels down
      with it. Fixed anchors it to the viewport and lets the page bounce
      underneath, which is the part that should move.

      Out of flow means it reserves no space, so anything that is not
      deliberately sitting under it needs the spacer below.
    */}
    <header
      className="nav"
      data-state={resolved}
      data-sticky={sticky ? 'true' : undefined}
      data-on-media={onMedia && resolved === 'top' ? (onMedia === 'light' ? 'light' : 'true') : undefined}
    >
      <div className="measure nav__inner">
        <a className="nav__logo" href="/" aria-label="Home"><Logo variant="wordmark" height={32} /></a>
        <nav className="nav__links" aria-label="Primary">
          {/*
            One link carries `cta` and renders primary; the rest stay ghost.
            Ghost is not a primary action — it exists for exactly this, the
            tertiary links that sit around the one thing worth doing.
          */}
          {links.map((l) => {
            const button = (
              <Button
                variant={l.cta ? 'primary' : 'ghost'}
                size="sm"
                href={l.href}
                aria-current={l.current ? 'page' : undefined}
              >
                {l.label}
              </Button>
            );
            /*
              The CTA gets a wrapper because Button owns its own className and
              the glow needs a pseudo-element behind the pill rather than on it.
              Presentational only — it adds no semantics and no tab stop.
            */
            return l.cta
              ? <span key={l.href} className="nav__cta">{button}</span>
              : <span key={l.href} className="nav__link">{button}</span>;
          })}
        </nav>
        <div className="nav__actions">{actions}</div>
        <div className="nav__menu">
          {/*
            `md`, not `sm`. At `sm` this was 32x32 — under Apple's 44pt minimum
            and under WCAG 2.5.5, and the only control on the page a phone user
            has to hit before they can navigate at all. It is the one button
            that cannot afford to be the smallest.

            It stays the menu icon while the sheet is open rather than swapping
            to a cross: the sheet carries its own close now, in the same place,
            and two controls claiming the same job is worse than one.
          */}
          <IconButton
            ref={triggerRef}
            icon="menu"
            variant="ghost"
            size="md"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="nav-menu-panel"
            onClick={() => setOpen(true)}
          />
        </div>
      </div>
    </header>

    {/*
      The scrim. Tapping outside a sheet to dismiss it is the gesture people
      arrive already knowing, and without it the only ways out are the close
      button and Escape — one of which a phone does not have.

      aria-hidden and not a button: it duplicates the close control, and a
      screen reader announcing "dismiss" twice is noise. Pointer users get the
      shortcut, keyboard users get Escape, and both get the real button.
    */}
    <div
      className="nav__scrim"
      data-open={open ? 'true' : undefined}
      onClick={() => setOpen(false)}
      aria-hidden="true"
    />

    {/*
      Kept mounted rather than conditionally rendered, so it has something to
      animate out from — an unmounted element cannot transition. `inert` is what
      makes that safe: while closed it is unreachable by tab, by screen reader
      and by pointer, which `visibility: hidden` alone does not guarantee across
      browsers.

      Outside the <header> because it is fixed to the viewport, not part of the
      bar.
    */}
    <div
      id="nav-menu-panel"
      ref={panelRef}
      className="nav__panel"
      data-open={open ? 'true' : undefined}
      inert={!open}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      {/*
        The sheet's own bar, the same height as the header and on the same
        gutter, so the close lands exactly where the trigger that opened it was.
        The button appears to stay put and change its mind, which is the whole
        reason it is here rather than left behind under the scrim.
      */}
      <div className="nav__panel-bar">
        <IconButton
          icon="cross"
          variant="ghost"
          size="md"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      </div>
      <nav className="nav__panel-links" aria-label="Primary">
        {links.map((l, i) => (
          <a
            key={l.href}
            className="nav__panel-link"
            href={l.href}
            aria-current={l.current ? 'page' : undefined}
            data-cta={l.cta ? 'true' : undefined}
            /* Staggered by index. Decorative, so it never gates interaction —
               the link is clickable from the first frame. */
            style={{ '--i': i } as CSSProperties}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </div>
    {/* Reserves the height the fixed header no longer occupies. Omitted when
        the nav deliberately overlays what is beneath it. */}
    {sticky && !onMedia && <div className="nav__spacer" aria-hidden="true" />}
    </>
  );
}
