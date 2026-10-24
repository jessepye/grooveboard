// Pure geometry helpers for drawing and erasing. Kept free of React and canvas
// so the logic is unit-testable on its own (ported from the prototype's
// `distToSegment` / `removeStrokesAt`).

import type { Point, Stroke } from './types'

/** Shortest distance from point `p` to the line *segment* `a`–`b` (not the
 * infinite line: the projection is clamped to the segment's endpoints). */
export function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y)
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const cx = a.x + t * dx
  const cy = a.y + t * dy
  return Math.hypot(p.x - cx, p.y - cy)
}

export interface EraseResult {
  /** The surviving strokes — the same reference as the input when unchanged. */
  strokes: Stroke[]
  /** Whether any stroke was removed. */
  changed: boolean
}

/**
 * Remove every stroke whose nearest segment lies within `radius` of `p`,
 * accounting for the stroke's own half-width. Returns the original array
 * untouched when nothing is hit, so callers can skip redundant state updates.
 */
export function eraseStrokesAt(strokes: Stroke[], p: Point, radius: number): EraseResult {
  let changed = false
  const kept = strokes.filter(stroke => {
    const reach = radius + (stroke.size || 4) / 2
    const hit = stroke.points.some((pt, i) => {
      const next = stroke.points[i + 1] ?? pt
      return distToSegment(p, pt, next) <= reach
    })
    if (hit) {
      changed = true
      return false
    }
    return true
  })
  return changed ? { strokes: kept, changed } : { strokes, changed }
}
