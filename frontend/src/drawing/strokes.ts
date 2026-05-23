// Pure drawing core: build strokes, stroke-erase by proximity, clear a page.
// All functions are immutable — they return new values and never mutate inputs.
// Ported from grooveboard-claude-design/whiteboard-parts.jsx (DrawCanvas).

import type { Paths, Point, Stroke, Tool } from './types'

/** Shortest distance from point `p` to the segment `a`–`b`. */
export function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) {
    const ddx = p.x - a.x
    const ddy = p.y - a.y
    return Math.sqrt(ddx * ddx + ddy * ddy)
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const cx = a.x + t * dx
  const cy = a.y + t * dy
  const ex = p.x - cx
  const ey = p.y - cy
  return Math.sqrt(ex * ex + ey * ey)
}

export interface BeginStrokeArgs {
  id: string
  tool: Tool
  color: string
  /** The user's chosen brush size, before per-tool adjustment. */
  size: number
  point: Point
}

/**
 * Start a new stroke at `point`, applying per-tool size adjustment.
 * Highlighter draws 4x fatter than the chosen size (matches the prototype).
 */
export function beginStroke({ id, tool, color, size, point }: BeginStrokeArgs): Stroke {
  return {
    id,
    tool,
    color,
    size: tool === 'highlighter' ? size * 4 : size,
    points: [point],
  }
}

/** Return a copy of `stroke` with `point` appended. */
export function extendStroke(stroke: Stroke, point: Point): Stroke {
  return { ...stroke, points: [...stroke.points, point] }
}

/**
 * Remove every stroke whose nearest segment lies within `radius` of `point`
 * (accounting for the stroke's own half-width). Returns the same array
 * reference when nothing is erased, so callers can skip redundant updates.
 */
export function eraseStrokesAt(
  strokes: Stroke[],
  point: Point,
  radius: number,
): Stroke[] {
  let removed = false
  const kept = strokes.filter(stroke => {
    const halfWidth = (stroke.size || 4) / 2
    const hit = stroke.points.some((pt, i) => {
      const next = stroke.points[i + 1] || pt
      return distToSegment(point, pt, next) <= radius + halfWidth
    })
    if (hit) {
      removed = true
      return false
    }
    return true
  })
  return removed ? kept : strokes
}

/** Return `paths` with the strokes on `page` emptied; other pages untouched. */
export function clearPage(paths: Paths, page: number): Paths {
  return { ...paths, [page]: [] }
}
