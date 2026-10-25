// Stroke construction. Pure and React-free so it's unit-testable.

import type { Point, Stroke, StrokeTool } from './types'

/** Highlighter strokes are drawn fat and semi-transparent (alpha is applied at
 * render time); the size is bumped here so the marker reads as a marker. */
export const HIGHLIGHTER_SIZE_MULTIPLIER = 4

/** Pixel-eraser strokes are wider than ink so rubbing out feels forgiving
 * (matches the prototype). Their color is irrelevant under destination-out. */
export const ERASER_SIZE_MULTIPLIER = 3
const ERASER_COLOR = '#000'

const SIZE_MULTIPLIER: Record<StrokeTool, number> = {
  pen: 1,
  highlighter: HIGHLIGHTER_SIZE_MULTIPLIER,
  eraser: ERASER_SIZE_MULTIPLIER,
}

/** Begin a stroke at `first`. `id` is injectable for deterministic tests;
 * otherwise a UUID is generated so ids don't collide across collaborators. */
export function createStroke(
  tool: StrokeTool,
  color: string,
  size: number,
  first: Point,
  id: string = crypto.randomUUID(),
): Stroke {
  return {
    id,
    tool,
    color: tool === 'eraser' ? ERASER_COLOR : color,
    size: size * SIZE_MULTIPLIER[tool],
    points: [first],
  }
}
