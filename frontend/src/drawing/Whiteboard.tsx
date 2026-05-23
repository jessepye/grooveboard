// Whiteboard — composes the drawing surface with lifted editor state.
// Ported from the prototype's Whiteboard (grooveboard-claude-design/whiteboard.jsx),
// keeping the patterns called out in CLAUDE.md: lifted state, logical-vs-screen
// coordinates, snapshot-based undo/redo, and useLayoutEffect for fit-zoom.

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { Paths, Tool } from './types'
import { clearPage as clearPageStrokes } from './strokes'
import { DrawCanvas, type EraserMode } from './DrawCanvas'
import { Toolbar } from './Toolbar'
import { Icon } from './Icon'

const PAGE_W = 1100
const PAGE_H = 850

interface Snapshot {
  paths: Paths
}

// Per-tool colors so each tool remembers its own pick.
type ToolColors = Record<Tool, string>
const DEFAULT_TOOL_COLORS: ToolColors = {
  pen: '#1F1D1A',
  highlighter: '#F8E16C',
  eraser: '#1F1D1A',
  shape: '#1F1D1A',
}

export function Whiteboard() {
  const [tool, setTool] = useState<Tool>('pen')
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke')
  const [toolColors, setToolColors] = useState<ToolColors>(DEFAULT_TOOL_COLORS)
  const color = toolColors[tool]
  const setColor = (c: string) => setToolColors(prev => ({ ...prev, [tool]: c }))
  const [size, setSize] = useState(4)
  const [paths, setPaths] = useState<Paths>({})
  const page = 0

  const [history, setHistory] = useState<Snapshot[]>([{ paths: {} }])
  const [histIdx, setHistIdx] = useState(0)

  const [fitScale, setFitScale] = useState(1)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Largest scale ≤ 1 that fits the page in the viewport (never up-scales here).
  useLayoutEffect(() => {
    const compute = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const r = wrap.getBoundingClientRect()
      const pad = 120
      const sw = (r.width - pad) / PAGE_W
      const sh = (r.height - pad) / PAGE_H
      setFitScale(Math.max(0.3, Math.min(1, Math.min(sw, sh))))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  const pushHistory = useCallback(
    (nextPaths: Paths) => {
      setHistory(prev => {
        const trimmed = prev.slice(0, histIdx + 1)
        trimmed.push({ paths: nextPaths })
        setHistIdx(trimmed.length - 1)
        return trimmed
      })
    },
    [histIdx],
  )

  const handlePathsChange = useCallback(
    (next: Paths) => {
      setPaths(next)
      pushHistory(next)
    },
    [pushHistory],
  )

  const undo = () => {
    if (histIdx === 0) return
    setPaths(history[histIdx - 1].paths)
    setHistIdx(histIdx - 1)
  }
  const redo = () => {
    if (histIdx >= history.length - 1) return
    setPaths(history[histIdx + 1].paths)
    setHistIdx(histIdx + 1)
  }

  const clearPage = () => {
    const next = clearPageStrokes(paths, page)
    setPaths(next)
    pushHistory(next)
  }

  const historyBtn: React.CSSProperties = {
    width: 30,
    height: 30,
    border: 0,
    background: 'transparent',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--gb-bg-deep)' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: PAGE_W,
          height: PAGE_H,
          transform: `translate(-50%, -50%) scale(${fitScale})`,
          background: 'var(--gb-paper)',
          borderRadius: 6,
          boxShadow: 'var(--gb-shadow-lg)',
          overflow: 'hidden',
        }}
      >
        <DrawCanvas
          tool={tool}
          eraserMode={eraserMode}
          color={color}
          size={size}
          paths={paths}
          onPathsChange={handlePathsChange}
          page={page}
          pageW={PAGE_W}
          pageH={PAGE_H}
          scale={fitScale}
        />
      </div>

      {/* Undo / redo cluster (top-right, mirrors the prototype's top bar). */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 40,
          background: 'var(--gb-paper)',
          border: 'var(--gb-stroke)',
          borderRadius: 'var(--gb-radius)',
          boxShadow: 'var(--gb-shadow-sm)',
          padding: 3,
          display: 'flex',
        }}
      >
        <button onClick={undo} disabled={histIdx === 0} title="Undo" aria-label="Undo" style={{ ...historyBtn, opacity: histIdx === 0 ? 0.3 : 1 }}>
          <Icon name="undo" size={15} />
        </button>
        <button
          onClick={redo}
          disabled={histIdx >= history.length - 1}
          title="Redo"
          aria-label="Redo"
          style={{ ...historyBtn, opacity: histIdx >= history.length - 1 ? 0.3 : 1 }}
        >
          <Icon name="redo" size={15} />
        </button>
      </div>

      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        eraserMode={eraserMode}
        setEraserMode={setEraserMode}
        onClearPage={clearPage}
        position="bottom"
      />
    </div>
  )
}
