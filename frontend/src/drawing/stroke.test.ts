import { describe, expect, it } from 'vitest'
import { createStroke, ERASER_SIZE_MULTIPLIER, HIGHLIGHTER_SIZE_MULTIPLIER } from './stroke'

describe('createStroke', () => {
  it('starts a pen stroke at the first point with the given color and size', () => {
    const s = createStroke('pen', '#F25B3A', 4, { x: 2, y: 3 }, 'id-1')
    expect(s).toEqual({
      id: 'id-1',
      tool: 'pen',
      color: '#F25B3A',
      size: 4,
      points: [{ x: 2, y: 3 }],
    })
  })

  it('fattens the highlighter so it reads as a marker', () => {
    const s = createStroke('highlighter', '#F8E16C', 4, { x: 0, y: 0 }, 'id-2')
    expect(s.size).toBe(4 * HIGHLIGHTER_SIZE_MULTIPLIER)
  })

  it('makes a pixel-eraser stroke wide and colorless', () => {
    // Pixel-eraser strokes are rendered with destination-out, so only their
    // shape matters; the color is fixed so the user's ink choice never leaks in.
    const s = createStroke('eraser', '#F25B3A', 4, { x: 0, y: 0 }, 'id-3')
    expect(s.tool).toBe('eraser')
    expect(s.color).toBe('#000')
    expect(s.size).toBe(4 * ERASER_SIZE_MULTIPLIER)
  })

  it('generates a unique id when none is supplied', () => {
    const a = createStroke('pen', '#000', 4, { x: 0, y: 0 })
    const b = createStroke('pen', '#000', 4, { x: 0, y: 0 })
    expect(a.id).not.toBe(b.id)
  })
})
