/**
 * Homepage arrivals. A .ts file, not a component: it must not change the
 * component count or grow a contract.
 *
 * The type is already on the page. This only moves it. If the script never
 * runs, or the reader has asked for less motion, nothing is hidden.
 *
 * The headline is not split into lines. A split was changing where it
 * wrapped, and on a phone it grew from two lines to three.
 *
 * Lenis is the smooth scroll, and only on a desktop pointer. A phone keeps
 * its own scroll. The logo loop stays in CSS, because a constant crawl is
 * not a GSAP job.
 *
 * Archive photos shift a little against the pointer. The shift is small
 * enough to stay inside the hover scale, so the frame edge never shows.
 * A UI capture is not in that set: sliding type out of its frame helps nobody.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { cssMs, cssVar, easingFromToken } from './number-ticker';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';

function seconds(token: string): number {
  const ms = cssMs(cssVar(token));
  return ms > 0 ? ms / 1000 : 0;
}

function shown(el: Element): boolean {
  const brand = el.closest<HTMLElement>('[data-brand-only]');
  return getComputedStyle(brand ?? el).display !== 'none';
}

function rise(targets: gsap.TweenTarget, ease: (p: number) => number, duration: number, delay = 0): void {
  gsap.from(targets, {
    y: cssVar('--primitive-space-sp800') || '24px',
    opacity: 0,
    duration,
    ease,
    delay,
    clearProps: 'opacity,transform',
  });
}

/** The lime bar under the accent word draws on. The bar is already there if this never runs. */
function wipeAccent(root: ParentNode, ease: (p: number) => number, duration: number, delay: number): void {
  const accent = Array.from(root.querySelectorAll<HTMLElement>('.home-hero__accent')).find((el) => shown(el) && el.textContent?.trim());
  if (!accent) return;
  gsap.fromTo(
    accent,
    { '--accent-wipe': '0%' },
    { '--accent-wipe': '100%', duration, ease, delay },
  );
}

export function bootHomeMotion(): void {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ease = easingFromToken(cssVar('--semantic-easing-out'));
    const duration = seconds('--semantic-duration-overlay') || 0.4;
    const step = seconds('--semantic-duration-instant') || 0.1;

    const title = document.querySelector('.home-hero__title');
    const standfirst = document.querySelector('.home-hero__standfirst');
    const actions = document.querySelector('.home-hero__actions');
    const clients = document.querySelector('[data-clients]');
    if (title) {
      rise(title, ease, duration);
      wipeAccent(title, ease, duration, step);
    }
    if (standfirst) rise(standfirst, ease, duration, step);
    if (actions) rise(actions, ease, duration, step * 2);
    if (clients) rise(clients, ease, duration, step * 2);

    const close = document.querySelector('.home-close__inner');
    if (close) {
      gsap.from(close, {
        y: cssVar('--primitive-space-sp800') || '24px',
        opacity: 0,
        duration,
        ease,
        scrollTrigger: { trigger: close, start: 'top 85%', once: true },
        clearProps: 'opacity,transform',
      });
    }

    for (const el of gsap.utils.toArray<HTMLElement>('.archive > li, .work > li')) {
      gsap.from(el, {
        y: cssVar('--primitive-space-sp800') || '24px',
        opacity: 0,
        duration,
        ease,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        clearProps: 'opacity,transform',
      });
    }

    const stopPan = followArchive();

    let lenis: Lenis | undefined;
    let raf: ((time: number) => void) | undefined;
    if (window.matchMedia(FINE_POINTER).matches) {
      lenis = new Lenis({
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        autoRaf: false,
        stopInertiaOnNavigate: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);

    return () => {
      stopPan();
      window.removeEventListener('load', refresh);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  });
}

/**
 * Moves the photo against the pointer, so the side you are looking toward
 * comes into the frame. The CSS transition is the smoothing. Setting the
 * value on every move and letting the transition catch up is the lag, and
 * a direct tie to the cursor is what feels mechanical.
 */
function followArchive(): () => void {
  if (!window.matchMedia(FINE_POINTER).matches) return () => {};
  const stops: Array<() => void> = [];
  for (const link of document.querySelectorAll<HTMLElement>('.archive__card, .work .tile')) {
    const imgs = [...link.querySelectorAll<HTMLElement>('img')];
    if (imgs.length === 0) continue;
    const move = (event: PointerEvent) => {
      const box = link.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      const limit = Math.min(box.width, box.height) * 0.018;
      for (const img of imgs) {
        img.style.setProperty('--pan-x', `${(-x * limit).toFixed(1)}px`);
        img.style.setProperty('--pan-y', `${(-y * limit).toFixed(1)}px`);
      }
    };
    const leave = () => {
      for (const img of imgs) {
        img.style.setProperty('--pan-x', '0px');
        img.style.setProperty('--pan-y', '0px');
      }
    };
    link.addEventListener('pointermove', move);
    link.addEventListener('pointerleave', leave);
    stops.push(() => {
      link.removeEventListener('pointermove', move);
      link.removeEventListener('pointerleave', leave);
      leave();
    });
  }
  return () => stops.forEach((stop) => stop());
}
