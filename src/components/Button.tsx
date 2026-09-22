import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  small?: boolean
  icon?: IconName
  /**
   * An icon that is not there until the pointer is. The button widens to make
   * room for it and closes again on the way out, so the icon arrives as part
   * of the same movement rather than popping into a space already held for it.
   */
  hoverIcon?: IconName
  children?: ReactNode
}

/**
 * An M3 button. Its icon fills on hover and focus, and its corners morph from
 * full to large on press — Expressive uses shape as the press feedback rather
 * than moving or scaling the control.
 */
export function Button({
  variant = 'text',
  small = false,
  icon,
  hoverIcon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={[
        'md-button',
        `md-button--${variant}`,
        small ? 'md-button--small' : null,
        hoverIcon ? 'md-button--has-reveal' : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ? <Icon name={icon} /> : null}
      {/*
        Taken out of flow on purpose: anything in the button's flex line takes
        width even when it measures zero, and that width comes off the label's
        centring. Out of flow it contributes nothing, so the label is centred
        at rest with no phantom space beside it.
      */}
      {hoverIcon ? (
        <span className="md-button__reveal" aria-hidden="true">
          <Icon name={hoverIcon} />
        </span>
      ) : null}
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** Required: an icon glyph has no accessible name of its own. */
  label: string
  danger?: boolean
  /** A ring that is always there, washed on hover rather than filled. */
  outlined?: boolean
}

export function IconButton({
  icon,
  label,
  danger = false,
  outlined = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={[
        'md-icon-button',
        danger ? 'md-icon-button--danger' : null,
        outlined ? 'md-icon-button--outlined' : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name={icon} />
    </button>
  )
}
