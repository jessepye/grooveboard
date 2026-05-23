// Core drawing types, ported from the design prototype's data model.
// Coordinates are logical page coordinates (see CLAUDE.md), not screen pixels.

export type Tool = 'pen' | 'highlighter' | 'eraser' | 'shape'

export interface Point {
  x: number
  y: number
}

export interface Stroke {
  id: string
  tool: Tool
  /** Logical page-space points, in draw order. */
  points: Point[]
  color: string
  /** Effective on-canvas line width (already tool-adjusted). */
  size: number
}

/** Strokes keyed by page index. A missing page has no strokes. */
export type Paths = Record<number, Stroke[]>
