// The floating tool palette, ported from the prototype's `Toolbar`
// (grooveboard-claude-design/whiteboard-parts.jsx).
//
// Tapping a different tool selects it; tapping the active tool again toggles its
// attached popover: color + size for pen/highlighter, modes for the eraser
// (which also opens on first switch). Clear is a two-tap confirm. The other
// prototype tools (select, sticky, text, shape, laser) are not ported yet.

import { useEffect, useState } from 'react'
import Icon, { type IconStyle } from './Icon'
import type { DrawTool, EraserMode, Tool } from '../drawing/types'

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

export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right'

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'pen', label: 'Pen' },
  { id: 'highlighter', label: 'Highlighter' },
  { id: 'eraser', label: 'Eraser' },
]

const hasColor = (t: Tool): t is DrawTool => t === 'pen' || t === 'highlighter'

const ERASER_MODES: { id: EraserMode; title: string; desc: string }[] = [
  { id: 'pixel', title: 'Pixel eraser', desc: 'Rub away small bits' },
  { id: 'stroke', title: 'Whole stroke', desc: 'Tap a line to remove it' },
]

export interface ToolbarProps {
  tool: Tool
  setTool: (t: Tool) => void
  /** Each ink tool's remembered color. */
  toolColors: Record<DrawTool, string>
  /** Sets the active ink tool's color. */
  setColor: (c: string) => void
  size: number
  setSize: (n: number) => void
  eraserMode: EraserMode
  setEraserMode: (m: EraserMode) => void
  onClearPage: () => void
  position?: ToolbarPosition
  iconStyle?: IconStyle
}

export default function Toolbar({
  tool,
  setTool,
  toolColors,
  setColor,
  size,
  setSize,
  eraserMode,
  setEraserMode,
  onClearPage,
  position = 'bottom',
  iconStyle = 'chunky',
}: ToolbarProps) {
  // The tool whose popover was last opened. Derived against the current tool
  // so a popover never outlives a tool switch.
  const [popoverFor, setPopoverFor] = useState<Tool | null>(null)
  const openPopover = popoverFor === tool ? tool : null
  const color = hasColor(tool) ? toolColors[tool] : null

  // Clearing is destructive, so it's a two-tap confirm that disarms itself.
  const [confirmClear, setConfirmClear] = useState(false)
  useEffect(() => {
    if (!confirmClear) return
    const id = setTimeout(() => setConfirmClear(false), 2500)
    return () => clearTimeout(id)
  }, [confirmClear])

  const handleToolClick = (id: Tool) => {
    if (tool === id) {
      setPopoverFor(openPopover ? null : id)
    } else {
      setTool(id)
      // The eraser's modes open on first switch so kids discover them.
      setPopoverFor(id === 'eraser' ? 'eraser' : null)
    }
  }

  return (
    <div
      className="gb-toolbar"
      role="toolbar"
      aria-label="Drawing tools"
      data-position={position}
    >
      {TOOLS.map(t => {
        const active = tool === t.id
        return (
          <div key={t.id} className="gb-tool-slot">
            <button
              className="gb-tool"
              aria-label={t.label}
              title={t.label}
              aria-pressed={active}
              data-active={active}
              onClick={() => handleToolClick(t.id)}
            >
              <Icon name={t.id} variant={iconStyle} size={22} />
              {hasColor(t.id) && (
                <span className="gb-tool-color" style={{ background: toolColors[t.id] }} />
              )}
              {t.id === 'eraser' && active && (
                <span className="gb-tool-mode" data-mode={eraserMode} />
              )}
            </button>

            {active && openPopover && hasColor(t.id) && (
              <div className="gb-popover gb-popover-colors" onMouseLeave={() => setPopoverFor(null)}>
                <div className="gb-swatches" role="group" aria-label="Colors">
                  {COLORS.map(c => (
                    <button
                      key={c.name}
                      className="gb-swatch"
                      aria-label={`Color ${c.name}`}
                      aria-pressed={color === c.value}
                      data-active={color === c.value}
                      style={{ background: c.value }}
                      onClick={() => {
                        setColor(c.value)
                        setPopoverFor(null)
                      }}
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
              </div>
            )}

            {active && openPopover && t.id === 'eraser' && (
              <div
                className="gb-popover gb-popover-modes"
                role="group"
                aria-label="Eraser mode"
                onMouseLeave={() => setPopoverFor(null)}
              >
                <div className="gb-popover-title">Eraser</div>
                {ERASER_MODES.map(m => (
                  <button
                    key={m.id}
                    className="gb-mode"
                    aria-pressed={eraserMode === m.id}
                    data-active={eraserMode === m.id}
                    onClick={() => {
                      setEraserMode(m.id)
                      setPopoverFor(null)
                    }}
                  >
                    <span className="gb-mode-dot" data-mode={m.id} />
                    <span>
                      <span className="gb-mode-title">{m.title}</span>
                      <span className="gb-mode-desc">{m.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="gb-toolbar-divider" />

      <button
        className="gb-clear"
        data-armed={confirmClear}
        aria-label={confirmClear ? 'Confirm clear page' : 'Clear page'}
        title={confirmClear ? 'Tap again to confirm' : 'Clear page'}
        onClick={() => {
          if (confirmClear) {
            onClearPage()
            setConfirmClear(false)
          } else {
            setConfirmClear(true)
          }
        }}
      >
        <Icon name="trash" variant={iconStyle} size={20} />
        {confirmClear && <span className="gb-clear-hint">Tap again to clear</span>}
      </button>
    </div>
  )
}
