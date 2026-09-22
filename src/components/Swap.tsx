import type { ReactNode } from 'react'

/**
 * Crossfades between a fixed set of labels.
 *
 * Every option stays mounted and they all share one grid cell, so the box is
 * always as large as the widest of them and a change is a pure opacity fade
 * with nothing reflowing underneath it. That is what makes it read as one label
 * becoming another, rather than as a string being swapped out.
 *
 * Only the showing option is exposed to assistive tech, so a control labelled
 * this way still has exactly one accessible name.
 */
export function Swap({
  active,
  options,
  className,
}: {
  active: string
  options: Record<string, ReactNode>
  className?: string
}) {
  return (
    <span className={['md-swap', className].filter(Boolean).join(' ')}>
      {Object.entries(options).map(([key, label]) => (
        <span
          key={key}
          className="md-swap__layer"
          data-active={key === active || undefined}
          aria-hidden={key === active ? undefined : true}
        >
          {label}
        </span>
      ))}
    </span>
  )
}
