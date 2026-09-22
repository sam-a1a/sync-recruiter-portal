import { haptic } from '../app/haptics'
import { Icon, type IconName } from './Icon'

/**
 * The circular outlined control the chrome uses for theme and sign-out.
 *
 * Lives here rather than in the rail because the bar needs the same thing: on
 * a wide window these sit at the foot of the rail, on a narrow one they move
 * up into the top bar, and there is no reason for two copies of one button.
 */
export function UtilityButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: IconName
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={['utility-button', className].filter(Boolean).join(' ')}
      title={label}
      aria-label={label}
      onClick={() => {
        /* A press, not a tick: these commit to something rather than moving
           between choices. */
        haptic('press')
        onClick()
      }}
    >
      <Icon name={icon} />
    </button>
  )
}
