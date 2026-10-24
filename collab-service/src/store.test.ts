// The BoardStore seam is what makes persistence swappable: in-memory for
// Phase 1 and tests, DynamoDB behind the same interface at deploy time.
// These tests pin the in-memory implementation, including its LRU cap
// (stored boards are an abuse surface — memory must be bounded).

import { describe, expect, it } from 'vitest'
import { InMemoryBoardStore } from './store.js'
import type { Paths } from './protocol.js'

const paths = (id: string): Paths => ({
  0: [{ id, tool: 'pen', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], color: '#000', size: 4 }],
})

describe('InMemoryBoardStore', () => {
  it('returns undefined for a board it has never seen', async () => {
    const store = new InMemoryBoardStore()
    expect(await store.load('missing')).toBeUndefined()
  })

  it('round-trips saved paths', async () => {
    const store = new InMemoryBoardStore()
    await store.save('b1', paths('s1'))
    expect(await store.load('b1')).toEqual(paths('s1'))
  })

  it('evicts the least-recently-used board beyond maxBoards', async () => {
    const store = new InMemoryBoardStore({ maxBoards: 2 })
    await store.save('b1', paths('s1'))
    await store.save('b2', paths('s2'))
    await store.load('b1') // touch b1 so b2 is now the coldest
    await store.save('b3', paths('s3'))

    expect(await store.load('b2')).toBeUndefined()
    expect(await store.load('b1')).toEqual(paths('s1'))
    expect(await store.load('b3')).toEqual(paths('s3'))
  })
})
