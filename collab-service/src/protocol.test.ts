// The relay forwards payloads straight into other people's browsers, so every
// inbound event is validated against these rules first. Shapes mirror the
// frontend's `useCollab` events: draw {page, stroke}, erase {page, strokes},
// clear {page}.

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LIMITS,
  isValidBoardId,
  validateClear,
  validateDraw,
  validateErase,
} from './protocol.js'

const stroke = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  tool: 'pen',
  points: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
  color: '#2A2118',
  size: 4,
  ...over,
})

describe('isValidBoardId', () => {
  it('accepts a random UUID (what the frontend mints)', () => {
    expect(isValidBoardId(crypto.randomUUID())).toBe(true)
  })

  it('rejects non-UUID ids', () => {
    for (const bad of ['', 'abc', '123', '../../../etc/passwd', 'x'.repeat(200)]) {
      expect(isValidBoardId(bad)).toBe(false)
    }
  })
})

describe('validateDraw', () => {
  it('accepts a well-formed draw event', () => {
    expect(validateDraw({ page: 0, stroke: stroke() }, DEFAULT_LIMITS)).toBe(true)
  })

  it('rejects non-object payloads', () => {
    for (const bad of [null, undefined, 42, 'draw', []]) {
      expect(validateDraw(bad, DEFAULT_LIMITS)).toBe(false)
    }
  })

  it('rejects a missing or malformed stroke', () => {
    expect(validateDraw({ page: 0 }, DEFAULT_LIMITS)).toBe(false)
    expect(validateDraw({ page: 0, stroke: { id: 's1' } }, DEFAULT_LIMITS)).toBe(false)
  })

  it('rejects non-numeric or non-finite point coordinates', () => {
    const strings = stroke({ points: [{ x: '1', y: 2 }, { x: 3, y: 4 }] })
    const infinite = stroke({ points: [{ x: 1, y: Infinity }, { x: 3, y: 4 }] })
    const nan = stroke({ points: [{ x: NaN, y: 2 }, { x: 3, y: 4 }] })
    for (const s of [strings, infinite, nan]) {
      expect(validateDraw({ page: 0, stroke: s }, DEFAULT_LIMITS)).toBe(false)
    }
  })

  it('rejects a stroke with more points than the cap', () => {
    const points = Array.from({ length: DEFAULT_LIMITS.maxPointsPerStroke + 1 }, (_, i) => ({
      x: i,
      y: i,
    }))
    expect(validateDraw({ page: 0, stroke: stroke({ points }) }, DEFAULT_LIMITS)).toBe(false)
  })

  it('rejects a fractional, negative, or missing page', () => {
    expect(validateDraw({ page: -1, stroke: stroke() }, DEFAULT_LIMITS)).toBe(false)
    expect(validateDraw({ page: 0.5, stroke: stroke() }, DEFAULT_LIMITS)).toBe(false)
    expect(validateDraw({ stroke: stroke() }, DEFAULT_LIMITS)).toBe(false)
  })

  it('rejects oversized id/tool/color strings (no smuggling blobs in metadata)', () => {
    expect(
      validateDraw({ page: 0, stroke: stroke({ color: 'x'.repeat(1000) }) }, DEFAULT_LIMITS),
    ).toBe(false)
    expect(
      validateDraw({ page: 0, stroke: stroke({ id: 'x'.repeat(1000) }) }, DEFAULT_LIMITS),
    ).toBe(false)
  })

  it('rejects a non-finite or absurd stroke size', () => {
    expect(validateDraw({ page: 0, stroke: stroke({ size: Infinity }) }, DEFAULT_LIMITS)).toBe(false)
    expect(validateDraw({ page: 0, stroke: stroke({ size: -4 }) }, DEFAULT_LIMITS)).toBe(false)
    expect(validateDraw({ page: 0, stroke: stroke({ size: 10000 }) }, DEFAULT_LIMITS)).toBe(false)
  })
})

describe('validateErase', () => {
  it('accepts a well-formed erase event, including an emptied page', () => {
    expect(validateErase({ page: 0, strokes: [stroke()] }, DEFAULT_LIMITS)).toBe(true)
    expect(validateErase({ page: 0, strokes: [] }, DEFAULT_LIMITS)).toBe(true)
  })

  it('rejects when any surviving stroke is malformed', () => {
    expect(
      validateErase({ page: 0, strokes: [stroke(), { junk: true }] }, DEFAULT_LIMITS),
    ).toBe(false)
  })

  it('rejects more surviving strokes than the cap', () => {
    const strokes = Array.from({ length: DEFAULT_LIMITS.maxStrokesPerErase + 1 }, () => stroke())
    expect(validateErase({ page: 0, strokes }, DEFAULT_LIMITS)).toBe(false)
  })
})

describe('validateClear', () => {
  it('accepts a well-formed clear event', () => {
    expect(validateClear({ page: 0 })).toBe(true)
  })

  it('rejects missing or invalid page', () => {
    for (const bad of [{}, { page: -1 }, { page: 'zero' }, null, 7]) {
      expect(validateClear(bad)).toBe(false)
    }
  })
})
