// The tool palette: a typed, slimmed port of the prototype's `Toolbar`.
//
// Milestone 1 scope is pen + eraser + color/size + clear. The prototype's other
// tools (highlighter, sticky, shape, laser, select) and the attached-popover
// layout are deferred — see docs/todo.md "Drawing features (deferred)".

import { useEffect, useState } from 'react'
import type { Tool } from '../drawing/types'

/** The brand palette, ported from the prototype's `COLORS`. */
export const COLORS = [
  { name: 'ink', value: '#2A2118' },
  { name: 'tomato', value: '#F25B3A' },
  { name: 'mango', value: '#FFB23F' },
  { name: 'lemon', value: '#F8E16C' },
  { name: 'mint', value: '#5DD0A8' },
  { name: 'sky', value: '#4FB3E8' },
  { name: 'grape', value: '#8B6CD9' },
  { name: 'bubblegum', value: '#F08AB8' },
] as const

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'pen', label: 'Pen' },
  { id: 'eraser', label: 'Eraser' },
]

export interface ToolbarProps {
  tool: Tool
  setTool: (t: Tool) => void
  color: string
  setColor: (c: string) => void
  size: number
  setSize: (n: number) => void
  onClearPage: () => void
}

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  onClearPage,
}: ToolbarProps) {
  // Clearing is destructive, so it's a two-tap confirm that disarms itself.
  const [confirmClear, setConfirmClear] = useState(false)
  useEffect(() => {
    if (!confirmClear) return
    const id = setTimeout(() => setConfirmClear(false), 2500)
    return () => clearTimeout(id)
  }, [confirmClear])

  return (
    <div className="gb-toolbar" role="toolbar" aria-label="Drawing tools">
      <div className="gb-toolbar-group">
        {TOOLS.map(t => (
          <button
            key={t.id}
            className="gb-tool"
            aria-label={t.label}
            aria-pressed={tool === t.id}
            data-active={tool === t.id}
            onClick={() => setTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="gb-toolbar-group" role="group" aria-label="Colors">
        {COLORS.map(c => (
          <button
            key={c.name}
            className="gb-swatch"
            aria-label={`Color ${c.name}`}
            aria-pressed={color === c.value}
            style={{ background: c.value }}
            data-active={color === c.value}
            onClick={() => setColor(c.value)}
          />
        ))}
      </div>

      <label className="gb-size">
        <span>Size</span>
        <input
          type="range"
          min={2}
          max={20}
          value={size}
          aria-label="Size"
          onChange={e => setSize(Number(e.target.value))}
        />
        <span aria-hidden>{size}</span>
      </label>

      <button
        className="gb-clear"
        data-armed={confirmClear}
        aria-label={confirmClear ? 'Confirm clear page' : 'Clear page'}
        onClick={() => {
          if (confirmClear) {
            onClearPage()
            setConfirmClear(false)
          } else {
            setConfirmClear(true)
          }
        }}
      >
        {confirmClear ? 'Tap to confirm' : 'Clear'}
      </button>
    </div>
  )
}
