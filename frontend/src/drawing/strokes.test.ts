import { describe, it, expect } from 'vitest'
import {
  beginStroke,
  extendStroke,
  eraseStrokesAt,
  clearPage,
  distToSegment,
} from './strokes'
import type { Paths, Stroke } from './types'

// A horizontal stroke from (0,0) to (100,0), width 4, on the ink color.
const penStroke = (): Stroke => ({
  id: 'a',
  tool: 'pen',
  color: '#1F1D1A',
  size: 4,
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
})

describe('distToSegment', () => {
  it('returns the perpendicular distance to the segment body', () => {
    const d = distToSegment({ x: 50, y: 10 }, { x: 0, y: 0 }, { x: 100, y: 0 })
    expect(d).toBeCloseTo(10)
  })

  it('clamps to the nearest endpoint when the projection falls outside', () => {
    const d = distToSegment({ x: -30, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 })
    expect(d).toBeCloseTo(30)
  })

  it('handles a zero-length segment (a == b) as point distance', () => {
    const d = distToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })
    expect(d).toBeCloseTo(5)
  })
})

describe('beginStroke', () => {
  it('seeds a pen stroke with the given point, color, and size', () => {
    const s = beginStroke({
      id: 'p1',
      tool: 'pen',
      color: '#F25B3A',
      size: 6,
      point: { x: 10, y: 20 },
    })
    expect(s).toEqual({
      id: 'p1',
      tool: 'pen',
      color: '#F25B3A',
      size: 6,
      points: [{ x: 10, y: 20 }],
    })
  })

  it('fattens the highlighter to 4x the chosen size', () => {
    const s = beginStroke({
      id: 'h1',
      tool: 'highlighter',
      color: '#F8E16C',
      size: 5,
      point: { x: 0, y: 0 },
    })
    expect(s.size).toBe(20)
    expect(s.tool).toBe('highlighter')
  })
})

describe('extendStroke', () => {
  it('appends a point without mutating the original stroke', () => {
    const s = beginStroke({
      id: 'p1',
      tool: 'pen',
      color: '#000',
      size: 4,
      point: { x: 0, y: 0 },
    })
    const next = extendStroke(s, { x: 5, y: 5 })
    expect(next.points).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ])
    expect(s.points).toHaveLength(1) // original untouched
    expect(next).not.toBe(s)
  })
})

describe('eraseStrokesAt', () => {
  it('removes a stroke when the point lands within radius of it', () => {
    const strokes = [penStroke()]
    const result = eraseStrokesAt(strokes, { x: 50, y: 1 }, 10)
    expect(result).toHaveLength(0)
  })

  it('keeps strokes that are farther than radius + half their width', () => {
    const strokes = [penStroke()] // size 4 → half-width 2
    const result = eraseStrokesAt(strokes, { x: 50, y: 100 }, 10)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(strokes[0])
  })

  it('removes only the strokes that are hit', () => {
    const near = penStroke()
    const far: Stroke = { ...penStroke(), id: 'b', points: [{ x: 0, y: 500 }, { x: 100, y: 500 }] }
    const result = eraseStrokesAt([near, far], { x: 50, y: 0 }, 10)
    expect(result.map(s => s.id)).toEqual(['b'])
  })

  it('returns the same array reference when nothing is erased', () => {
    const strokes = [penStroke()]
    const result = eraseStrokesAt(strokes, { x: 50, y: 100 }, 10)
    expect(result).toBe(strokes)
  })
})

describe('clearPage', () => {
  it('empties the given page while leaving other pages intact', () => {
    const paths: Paths = {
      0: [penStroke()],
      1: [{ ...penStroke(), id: 'other' }],
    }
    const next = clearPage(paths, 0)
    expect(next[0]).toEqual([])
    expect(next[1]).toBe(paths[1])
  })

  it('does not mutate the input', () => {
    const paths: Paths = { 0: [penStroke()] }
    clearPage(paths, 0)
    expect(paths[0]).toHaveLength(1)
  })
})
