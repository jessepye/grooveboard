import { describe, expect, it } from 'vitest'
import { distToSegment, eraseStrokesAt } from './geometry'
import type { Stroke } from './types'

describe('distToSegment', () => {
  it('measures distance to the nearest point on the segment', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 0 }
    // Directly above the middle of the segment.
    expect(distToSegment({ x: 5, y: 4 }, a, b)).toBe(4)
  })

  it('clamps past the endpoints (no infinite line)', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 0 }
    // Off the right end: distance is to endpoint b, not the extended line.
    expect(distToSegment({ x: 13, y: 0 }, a, b)).toBe(3)
  })

  it('handles a degenerate zero-length segment', () => {
    const a = { x: 2, y: 2 }
    expect(distToSegment({ x: 5, y: 6 }, a, a)).toBe(5) // 3-4-5 triangle
  })
})

const strokeAt = (id: string, points: Stroke['points']): Stroke => ({
  id,
  tool: 'pen',
  color: '#000',
  size: 4,
  points,
})

describe('eraseStrokesAt', () => {
  const horizontal = strokeAt('h', [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ])
  const faraway = strokeAt('f', [
    { x: 0, y: 500 },
    { x: 100, y: 500 },
  ])

  it('removes strokes within the eraser radius and keeps the rest', () => {
    const result = eraseStrokesAt([horizontal, faraway], { x: 50, y: 3 }, 10)
    expect(result.changed).toBe(true)
    expect(result.strokes.map(s => s.id)).toEqual(['f'])
  })

  it('returns the same array reference when nothing is hit', () => {
    const input = [horizontal, faraway]
    const result = eraseStrokesAt(input, { x: 50, y: 300 }, 10)
    expect(result.changed).toBe(false)
    expect(result.strokes).toBe(input)
  })

  it('accounts for stroke width when testing a hit', () => {
    const thick = strokeAt('t', [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ])
    thick.size = 40 // half-width 20
    // 15px away from the centerline: a miss for a thin line, a hit for this one.
    expect(eraseStrokesAt([thick], { x: 50, y: 15 }, 2).changed).toBe(true)
  })

  it('is a no-op on an empty list', () => {
    const result = eraseStrokesAt([], { x: 0, y: 0 }, 10)
    expect(result.changed).toBe(false)
    expect(result.strokes).toEqual([])
  })
})
