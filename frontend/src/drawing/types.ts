// The drawing data model — ported from the prototype's `paths[pageIndex]` shape
// (see CLAUDE.md → Data Model), now typed.
//
// Coordinates are *logical page coordinates* (the page is a fixed logical size,
// e.g. 1100×850 for letter), independent of the on-screen zoom. Pointer handlers
// divide client coordinates by the active scale to recover these.

export interface Point {
  x: number
  y: number
}

/** Tools that draw ink. */
export type DrawTool = 'pen' | 'highlighter'

/** Every selectable tool. */
export type Tool = DrawTool | 'eraser'

/** What a persisted stroke can be: ink, or a pixel-eraser rub (drawn with
 * `destination-out`, so it cuts through the ink beneath it). */
export type StrokeTool = DrawTool | 'eraser'

/** How the eraser behaves: rub out pixels, or delete a whole stroke on contact. */
export type EraserMode = 'pixel' | 'stroke'

export interface Stroke {
  id: string
  tool: StrokeTool
  color: string
  size: number
  points: Point[]
}

/** Strokes keyed by page index. A page with no strokes may be absent. */
export type Paths = Record<number, Stroke[]>
