import type { ButtonHTMLAttributes, Ref } from 'react';
import { Icon, type IconName } from './Icon';
import type { ButtonVariant, ButtonSize } from './Button';
import './IconButton.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: IconName;
  /** Required. With no visible text there is no accessible name without it. */
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * React 19 passes `ref` to function components as an ordinary prop, so no
   * forwardRef is needed — but it is not part of ButtonHTMLAttributes, so it
   * has to be declared to be typed. Nav needs it to return focus to the menu
   * trigger when the panel closes.
   */
  ref?: Ref<HTMLButtonElement>;
}

const ICON_SIZE = { sm: 16, md: 20, lg: 24 } as const;

/**
 * Square by construction: one size token drives both axes, so the pill radius
 * resolves to a true circle at every size.
 *
 * `aria-label` is a required prop, not an optional one — TypeScript enforces
 * what a Figma variant never could.
 */
export function IconButton({ icon, variant = 'primary', size = 'md', ...rest }: IconButtonProps) {
  return (
    <button className="icon-button" data-variant={variant} data-size={size} type={rest.type ?? 'button'} {...rest}>
      <Icon name={icon} size={ICON_SIZE[size]} />
    </button>
  );
}
