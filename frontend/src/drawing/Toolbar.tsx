// Toolbar — the floating tool palette, ported from the prototype
// (grooveboard-claude-design/whiteboard-parts.jsx) into typed React.
//
// Visual features preserved: per-tool color + size popover, eraser-mode
// popover, two-tap-to-confirm clear, four dock positions, and chunky/line
// icon styling. Tool set is scoped to the wired tools (pen / highlighter /
// eraser); select / sticky / text / shape / laser remain to be ported.

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Tool } from './types'
import type { EraserMode } from './DrawCanvas'
import { COLORS } from './colors'
import { Icon, type IconStyle } from './Icon'

export type ToolbarPosition = 'top' | 'bottom' | 'left' | 'right'

export interface ToolbarProps {
  tool: Tool
  setTool: (t: Tool) => void
  color: string
  setColor: (c: string) => void
  size: number
  setSize: (n: number) => void
  eraserMode: EraserMode
  setEraserMode: (m: EraserMode) => void
  onClearPage: () => void
  position?: ToolbarPosition
  iconStyle?: IconStyle
}

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'pen', label: 'Pen' },
  { id: 'highlighter', label: 'Highlighter' },
  { id: 'eraser', label: 'Eraser' },
]

const COLOR_TOOLS: Tool[] = ['pen', 'highlighter']

const ERASER_MODES: { id: EraserMode; title: string; desc: string }[] = [
  { id: 'pixel', title: 'Pixel eraser', desc: 'Rub away small bits' },
  { id: 'stroke', title: 'Whole stroke', desc: 'Tap a line to remove it' },
]

export function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  eraserMode,
  setEraserMode,
  onClearPage,
  position = 'bottom',
  iconStyle = 'chunky',
}: ToolbarProps) {
  // Which tool's attached popover is open ('pen' | 'highlighter' | 'eraser' | null).
  const [openPopover, setOpenPopover] = useState<Tool | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // Close any popover that doesn't belong to the current tool.
  useEffect(() => {
    if (openPopover && openPopover !== tool) setOpenPopover(null)
  }, [tool, openPopover])

  // Auto-reset the clear confirmation after a beat.
  useEffect(() => {
    if (!confirmClear) return
    const id = setTimeout(() => setConfirmClear(false), 2500)
    return () => clearTimeout(id)
  }, [confirmClear])

  const isVertical = position === 'left' || position === 'right'

  const containerStyle: CSSProperties = {
    position: 'absolute',
    background: 'var(--gb-paper)',
    border: 'var(--gb-stroke)',
    borderRadius: 'var(--gb-radius-pill)',
    boxShadow: 'var(--gb-shadow-md)',
    padding: 8,
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: 4,
    alignItems: 'center',
    zIndex: 50,
    ...(position === 'bottom' && { bottom: 24, left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'top' && { top: 84, left: '50%', transform: 'translateX(-50%)' }),
    ...(position === 'left' && { left: 24, top: '50%', transform: 'translateY(-50%)' }),
    ...(position === 'right' && { right: 24, top: '50%', transform: 'translateY(-50%)' }),
  }

  const popoverAnchor: CSSProperties = {
    ...(position === 'bottom' && { bottom: 56 }),
    ...(position === 'top' && { top: 56 }),
    ...(position === 'left' && { left: 56 }),
    ...(position === 'right' && { right: 56 }),
  }
  const popoverCross: CSSProperties = isVertical
    ? { top: '50%', transform: 'translateY(-50%)' }
    : { left: '50%', transform: 'translateX(-50%)' }

  const handleToolClick = (id: Tool) => {
    if (tool === id) {
      // Re-clicking the active tool toggles its popover (color or eraser modes).
      if (COLOR_TOOLS.includes(id) || id === 'eraser') {
        setOpenPopover(p => (p === id ? null : id))
      }
    } else {
      setTool(id)
      setOpenPopover(id === 'eraser' ? 'eraser' : null)
    }
  }

  return (
    <div role="toolbar" aria-label="Drawing tools" style={containerStyle}>
      <div
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          gap: 4,
          alignItems: 'center',
        }}
      >
        {TOOLS.map(t => {
          const active = tool === t.id
          const hasColor = COLOR_TOOLS.includes(t.id)
          const showColorPop = openPopover === t.id && hasColor
          const showEraserPop = openPopover === 'eraser' && t.id === 'eraser'
          return (
            <div key={t.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleToolClick(t.id)}
                title={t.label}
                aria-pressed={active}
                style={{
                  position: 'relative',
                  width: 44,
                  height: 44,
                  border: 'none',
                  borderRadius: '50%',
                  background: active ? 'var(--gb-ink)' : 'transparent',
                  color: active ? 'var(--gb-paper)' : 'var(--gb-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <Icon name={t.id} variant={iconStyle} size={22} />
                {hasColor && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 7,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 18,
                      height: 4,
                      borderRadius: 2,
                      background: color,
                      boxShadow: active ? '0 0 0 1.5px var(--gb-paper)' : 'none',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {t.id === 'eraser' && active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: eraserMode === 'stroke' ? 'var(--gb-tomato)' : 'var(--gb-mango)',
                      border: '1.5px solid var(--gb-paper)',
                    }}
                  />
                )}
              </button>

              {showColorPop && (
                <div
                  onMouseLeave={() => setOpenPopover(null)}
                  style={{
                    position: 'absolute',
                    ...popoverAnchor,
                    ...popoverCross,
                    background: 'var(--gb-paper)',
                    border: 'var(--gb-stroke)',
                    borderRadius: 14,
                    boxShadow: 'var(--gb-shadow-md)',
                    padding: 10,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    width: 168,
                    zIndex: 60,
                  }}
                >
                  {COLORS.map(c => (
                    <button
                      key={c.name}
                      aria-label={`Color ${c.name}`}
                      onClick={() => {
                        setColor(c.value)
                        setOpenPopover(null)
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: c.value,
                        border: color === c.value ? '3px solid var(--gb-ink)' : '2px solid var(--gb-ink)',
                        outline: color === c.value ? '2px solid var(--gb-paper)' : 'none',
                        outlineOffset: -5,
                      }}
                    />
                  ))}
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 6,
                      paddingTop: 8,
                      borderTop: '1.5px solid var(--gb-line)',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gb-ink-soft)' }}>SIZE</span>
                    <input
                      type="range"
                      aria-label="Size"
                      min={2}
                      max={20}
                      value={size}
                      onChange={e => setSize(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 800, width: 22, textAlign: 'right' }}>{size}</span>
                  </div>
                </div>
              )}

              {showEraserPop && (
                <div
                  role="group"
                  aria-label="Eraser"
                  onMouseLeave={() => setOpenPopover(null)}
                  style={{
                    position: 'absolute',
                    ...popoverAnchor,
                    ...popoverCross,
                    background: 'var(--gb-paper)',
                    border: 'var(--gb-stroke)',
                    borderRadius: 14,
                    boxShadow: 'var(--gb-shadow-md)',
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    width: 200,
                    zIndex: 60,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--gb-ink-soft)',
                      padding: '2px 4px 4px',
                    }}
                  >
                    Eraser
                  </div>
                  {ERASER_MODES.map(m => {
                    const modeActive = eraserMode === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setEraserMode(m.id)
                          setOpenPopover(null)
                        }}
                        style={{
                          textAlign: 'left',
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          padding: '8px 10px',
                          border: modeActive ? '1.5px solid var(--gb-ink)' : 'var(--gb-stroke)',
                          borderRadius: 10,
                          background: modeActive ? 'var(--gb-bg-deep)' : 'transparent',
                        }}
                      >
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: m.id === 'stroke' ? 'var(--gb-tomato)' : 'var(--gb-mango)',
                            flexShrink: 0,
                            border: '1.5px solid var(--gb-ink)',
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--gb-ink-soft)', marginTop: 1 }}>{m.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Divider before the destructive action. */}
      <div
        style={{
          width: isVertical ? 28 : 1,
          height: isVertical ? 1 : 28,
          background: 'var(--gb-line)',
          margin: isVertical ? '4px 0' : '0 4px',
        }}
      />

      {/* Clear page — two-tap confirm. */}
      <button
        aria-label="Clear page"
        onClick={() => {
          if (confirmClear) {
            onClearPage()
            setConfirmClear(false)
          } else {
            setConfirmClear(true)
          }
        }}
        title={confirmClear ? 'Tap again to confirm' : 'Clear page'}
        style={{
          position: 'relative',
          width: 44,
          height: 44,
          border: confirmClear ? '1.5px solid var(--gb-tomato)' : 'none',
          borderRadius: '50%',
          background: confirmClear ? 'var(--gb-tomato)' : 'transparent',
          color: confirmClear ? 'var(--gb-paper)' : 'var(--gb-ink-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="trash" variant={iconStyle} size={20} />
        {confirmClear && (
          <span
            style={{
              position: 'absolute',
              ...(isVertical
                ? { left: 52, top: '50%', transform: 'translateY(-50%)' }
                : { bottom: 52, left: '50%', transform: 'translateX(-50%)' }),
              background: 'var(--gb-ink)',
              color: 'var(--gb-paper)',
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            Tap again to clear
          </span>
        )}
      </button>
    </div>
  )
}
