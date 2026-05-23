// DrawCanvas — the drawing surface. Ported from the prototype's DrawCanvas
// (grooveboard-claude-design/whiteboard-parts.jsx) into typed React.
//
// Strokes are stored in logical page coordinates, independent of zoom; the
// pure stroke math lives in ./strokes. Pointer handling and <canvas> painting
// stay here. Painting is guarded so it no-ops when no 2D context is available
// (e.g. jsdom under test).

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point, Paths, Stroke, Tool } from './types'
import { beginStroke, eraseStrokesAt, extendStroke } from './strokes'

export type EraserMode = 'pixel' | 'stroke'

export interface DrawCanvasProps {
  tool: Tool
  eraserMode: EraserMode
  color: string
  size: number
  paths: Paths
  onPathsChange: (next: Paths) => void
  page: number
  pageW: number
  pageH: number
  /** Current zoom scale; used to convert client px → logical page coords. */
  scale: number
}

const DRAW_TOOLS: Tool[] = ['pen', 'highlighter', 'eraser']

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s${Date.now()}${Math.random().toString(36).slice(2)}`
}

export function DrawCanvas({
  tool,
  eraserMode,
  color,
  size,
  paths,
  onPathsChange,
  page,
  pageW,
  pageH,
  scale,
}: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const currentPath = useRef<Stroke | null>(null)
  const erasingRef = useRef(false)

  const isDrawTool = DRAW_TOOLS.includes(tool)
  const isStrokeEraser = tool === 'eraser' && eraserMode === 'stroke'

  const redraw = useCallback(() => {
    const cv = canvasRef.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    ctx.clearRect(0, 0, cv.width, cv.height)
    const all = (paths[page] || []).concat(currentPath.current ? [currentPath.current] : [])
    for (const p of all) {
      if (p.points.length < 2) continue
      ctx.beginPath()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.size
      ctx.globalAlpha = p.tool === 'highlighter' ? 0.35 : 1
      ctx.globalCompositeOperation = p.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.moveTo(p.points[0].x, p.points[0].y)
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }, [paths, page])

  // Size the backing store to logical page dims, scaled for hi-DPI crispness.
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    cv.width = pageW * dpr
    cv.height = pageH * dpr
    cv.style.width = `${pageW}px`
    cv.style.height = `${pageH}px`
    cv.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw()
  }, [redraw, pageW, pageH])

  useEffect(() => {
    redraw()
  }, [redraw])

  // Client coords → logical page coords (undo the zoom scale).
  const toLocal = (e: { clientX: number; clientY: number }): Point => {
    const r = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - r.left) / scale,
      y: (e.clientY - r.top) / scale,
    }
  }

  const eraseAt = (p: Point) => {
    const list = paths[page] || []
    const kept = eraseStrokesAt(list, p, 10)
    if (kept !== list) onPathsChange({ ...paths, [page]: kept })
  }

  const start = (e: React.MouseEvent) => {
    if (!isDrawTool) return
    const p = toLocal(e)
    if (isStrokeEraser) {
      erasingRef.current = true
      eraseAt(p)
      return
    }
    currentPath.current = beginStroke({ id: newId(), tool, color, size, point: p })
    setDrawing(true)
  }

  const move = (e: React.MouseEvent) => {
    if (isStrokeEraser && erasingRef.current) {
      eraseAt(toLocal(e))
      return
    }
    if (!drawing || !currentPath.current) return
    currentPath.current = extendStroke(currentPath.current, toLocal(e))
    redraw()
  }

  const end = () => {
    erasingRef.current = false
    if (!drawing || !currentPath.current) return
    onPathsChange({ ...paths, [page]: (paths[page] || []).concat([currentPath.current]) })
    currentPath.current = null
    setDrawing(false)
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: isDrawTool ? 'crosshair' : 'default',
      }}
    />
  )
}
