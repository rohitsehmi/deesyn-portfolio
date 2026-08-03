import './Icon.css';
import { paths, type IconName } from './icon-paths';

export type { IconName };

export interface IconProps {
  name: IconName;
  /** 16 / 20 / 24. Defaults to 24, the grid the assets are drawn on. */
  size?: 16 | 20 | 24;
  /** Icons are decorative unless given a label; then they get an accessible name. */
  label?: string;
}

/**
 * Real Revolut assets, used verbatim from assets.revolut.com — filled paths on
 * a 24px grid, matching Revolut's fill-based mono system. `fill: currentColor`
 * is the equivalent of their `var(--rui-color-foreground)`: the icon takes the
 * colour of whatever it sits in, so it flips inside an inverse band for free.
 */
export function Icon({ name, size = 24, label }: IconProps) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g transform={name === 'arrow-up-right' ? 'rotate(-45 12 12)' : undefined}>
        {paths[name].map((d, i) => <path key={i} d={d} fillRule="evenodd" clipRule="evenodd" />)}
      </g>
    </svg>
  );
}
