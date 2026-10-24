// The drawing surface for one page. A typed port of the prototype's
// `DrawCanvas`, with the geometry/stroke logic lifted into tested pure helpers.
//
// It owns no persistent state: pen/highlighter strokes are reported via
// `onCommitStroke` on release, and stroke-erasures via `onErase` (the page's
// surviving strokes). The parent decides how to store and broadcast them.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { eraseStrokesAt } from '../drawing/geometry'
import { createStroke } from '../drawing/stroke'
import type { Point, Stroke, Tool } from '../drawing/types'

/** Eraser hit radius in logical px (matches the prototype's stroke eraser). */
const ERASER_RADIUS = 10

export interface DrawCanvasProps {
  tool: Tool
  color: string
  size: number
  /** Strokes for the page currently shown. */
  strokes: Stroke[]
  /** Active zoom; client coords are divided by this to get logical coords. */
  scale: number
  /** Logical page dimensions. */
  width: number
  height: number
  onCommitStroke: (stroke: Stroke) => void
  onErase: (survivingStrokes: Stroke[]) => void
}

export default function DrawCanvas({
  tool,
  color,
  size,
  strokes,
  scale,
  width,
  height,
  onCommitStroke,
  onErase,
}: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const current = useRef<Stroke | null>(null)
  const erasing = useRef(false)

  const redraw = useCallback(() => {
    const cv = canvasRef.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return // no 2D context (e.g. under jsdom) — nothing to paint
    ctx.clearRect(0, 0, cv.width, cv.height)
    const all = current.current ? [...strokes, current.current] : strokes
    for (const p of all) {
      if (p.points.length < 2) continue
      ctx.beginPath()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.size
      ctx.globalAlpha = p.tool === 'highlighter' ? 0.35 : 1
      ctx.moveTo(p.points[0].x, p.points[0].y)
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, [strokes])

  // Size the backing store to the logical page, scaled up for crisp hi-DPI.
  useLayoutEffect(() => {
    const cv = canvasRef.current
    const ctx = cv?.getContext('2d')
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    cv.width = width * dpr
    cv.height = height * dpr
    cv.style.width = `${width}px`
    cv.style.height = `${height}px`
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw()
  }, [redraw, width, height])

  useEffect(() => {
    redraw()
  }, [redraw])

  const isDrawTool = tool === 'pen' || tool === 'highlighter'

  /** Client coords -> logical page coords (undo the zoom). */
  const toLocal = (e: React.MouseEvent): Point => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }
  }

  const eraseAt = (p: Point) => {
    const result = eraseStrokesAt(strokes, p, ERASER_RADIUS)
    if (result.changed) onErase(result.strokes)
  }

  const start = (e: React.MouseEvent) => {
    const p = toLocal(e)
    if (tool === 'eraser') {
      erasing.current = true
      eraseAt(p)
      return
    }
    if (!isDrawTool) return
    current.current = createStroke(tool, color, size, p)
    setDrawing(true)
  }

  const move = (e: React.MouseEvent) => {
    if (tool === 'eraser') {
      if (erasing.current) eraseAt(toLocal(e))
      return
    }
    if (!drawing || !current.current) return
    current.current.points.push(toLocal(e))
    redraw()
  }

  const end = () => {
    erasing.current = false
    if (!current.current) return
    const stroke = current.current
    current.current = null
    setDrawing(false)
    // A lone point isn't a stroke; the canvas can't render it and there's
    // nothing meaningful to broadcast.
    if (stroke.points.length >= 2) onCommitStroke(stroke)
  }

  const penCursor =
    `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'>` +
    `<circle cx='10' cy='10' r='6' fill='${encodeURIComponent(color)}' stroke='%232A2118' stroke-width='2'/></svg>") 10 10, crosshair`

  return (
    <canvas
      ref={canvasRef}
      aria-label="drawing canvas"
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: isDrawTool || tool === 'eraser' ? penCursor : 'default',
      }}
    />
  )
}
