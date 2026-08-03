import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Base {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: IconName;
  iconTrailing?: IconName;
  children?: React.ReactNode;
}
type Props =
  | (Base & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (Base & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string });

const ICON_SIZE = { sm: 16, md: 20, lg: 20 } as const;

/**
 * Pill button.
 *
 * Note what changes between Figma and here. In Figma, `state` has to be a
 * variant axis — the file cannot express a pseudo-class. In code hover and
 * disabled are `:hover` and `:disabled`, and press is `transform: scale(0.97)`
 * over `duration/press`, which Figma could not represent at all without
 * breaking its layout grid. The contract is the same; the mechanism differs.
 *
 * Ghost is not a primary action. It exists for nav links and tertiary actions.
 */
export function Button({ variant = 'primary', size = 'md', iconLeading, iconTrailing, children, ...rest }: Props) {
  const content = (
    <>
      {iconLeading && <Icon name={iconLeading} size={ICON_SIZE[size]} />}
      {children && <span className="button__label">{children}</span>}
      {iconTrailing && <Icon name={iconTrailing} size={ICON_SIZE[size]} />}
    </>
  );
  const cls = 'button';
  if ('href' in rest && rest.href !== undefined) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a className={cls} data-variant={variant} data-size={size} {...a}>{content}</a>;
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button className={cls} data-variant={variant} data-size={size} type={b.type ?? 'button'} {...b}>{content}</button>;
}
