import { describe, expect, it } from 'vitest'
import { resolveBoardId } from './boardId'

describe('resolveBoardId', () => {
  it('uses an existing ?board= id', () => {
    const r = resolveBoardId('?board=abc-123')
    expect(r).toEqual({ boardId: 'abc-123', created: false })
  })

  it('mints a new id when none is present', () => {
    const r = resolveBoardId('')
    expect(r.created).toBe(true)
    expect(r.boardId).toMatch(/[0-9a-f-]{36}/) // a UUID
  })

  it('mints fresh, unguessable ids each time (no sequential boards)', () => {
    expect(resolveBoardId('').boardId).not.toBe(resolveBoardId('').boardId)
  })

  it('ignores an empty board param', () => {
    expect(resolveBoardId('?board=').created).toBe(true)
  })
})
