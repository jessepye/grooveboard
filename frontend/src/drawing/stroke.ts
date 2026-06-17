// Stroke construction. Pure and React-free so it's unit-testable.

import type { DrawTool, Point, Stroke } from './types'

/** Highlighter strokes are drawn fat and semi-transparent (alpha is applied at
 * render time); the size is bumped here so the marker reads as a marker. */
export const HIGHLIGHTER_SIZE_MULTIPLIER = 4

/** Begin a stroke at `first`. `id` is injectable for deterministic tests;
 * otherwise a UUID is generated so ids don't collide across collaborators. */
export function createStroke(
  tool: DrawTool,
  color: string,
  size: number,
  first: Point,
  id: string = crypto.randomUUID(),
): Stroke {
  return {
    id,
    tool,
    color,
    size: tool === 'highlighter' ? size * HIGHLIGHTER_SIZE_MULTIPLIER : size,
    points: [first],
  }
}
