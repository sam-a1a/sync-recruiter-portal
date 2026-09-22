import type { ReactNode } from 'react'

/**
 * Expands and collapses its content.
 *
 * The height animates on `grid-template-rows: 0fr -> 1fr`, because `height:
 * auto` does not interpolate and a pixel height would have to be kept in step
 * with whatever is inside it.
 *
 * Closed content stays mounted so it can animate out, and is marked `inert` so
 * nothing inside a collapsed row can still be tabbed to or read aloud.
 *
 * Two knobs, both set by the container rather than here:
 *   --md-reveal-gap    the gap the parent puts around this row, swallowed
 *                      while closed so a collapsed row leaves no hole.
 *   --md-reveal-bleed  room for content that paints outside its own box, such
 *                      as a field's floating label.
 */
export function Reveal({
  open,
  className,
  children,
}: {
  open: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={['md-reveal', className].filter(Boolean).join(' ')}
      data-open={open || undefined}
      inert={!open}
    >
      <div className="md-reveal__inner">{children}</div>
    </div>
  )
}
