import { Icon } from './Icon';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  /** sm 32, md 44, lg 48. Marketing minimum is 48. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Flips the site between light and dark, and remembers the choice.
 *
 * Which icon shows is decided in CSS, not JavaScript, using the same cascade
 * tokens.css uses to resolve the theme: `[data-theme]` when a choice has been
 * made, `prefers-color-scheme` when it has not. That means the correct icon is
 * painted before any script runs and there is no hydration mismatch to work
 * around. The button shows where you are going, not where you are.
 *
 * The accessible name is state independent on purpose. "Switch colour theme"
 * is true in both directions, so it needs no JavaScript to stay accurate, and
 * a screen reader user is told what the control does rather than what the
 * page currently looks like.
 *
 * The no-flash script lives in Base.astro and has to run before first paint,
 * so it cannot live here.
 *
 * revolut.com has no theme toggle, so this is a deliberate departure. It earns
 * its place on this site because the whole system is dual-theme by
 * construction and this is the only way a reader can see that.
 */
export function ThemeToggle({ size = 'lg' }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="theme-toggle icon-button"
      data-variant="secondary"
      data-size={size}
      aria-label="Switch colour theme"
      onClick={() => {
        const root = document.documentElement;
        const current =
          root.dataset.theme ??
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch { /* private mode */ }
      }}
    >
      <span className="theme-toggle__icon" data-shows="dark"><Icon name="moon" size={24} /></span>
      <span className="theme-toggle__icon" data-shows="light"><Icon name="sun" size={24} /></span>
    </button>
  );
}
