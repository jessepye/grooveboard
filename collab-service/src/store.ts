// The persistence seam. The relay talks only to this interface; swapping the
// in-memory implementation for DynamoDB (Phase 2 deploy) must not touch
// server.ts. Implementations may persist lazily — the relay treats saves as
// fire-and-forget.

import type { Paths } from './protocol.js'

export interface BoardStore {
  /** Resolve a board's last-saved paths, or undefined if never saved. */
  load(boardId: string): Promise<Paths | undefined>
  save(boardId: string, paths: Paths): Promise<void>
}

export interface InMemoryBoardStoreOptions {
  /** LRU cap: stored boards are bounded memory, oldest-touched evicted first. */
  maxBoards?: number
}

/**
 * Phase 1 store: board state survives everyone leaving (and rejoining after a
 * refresh) but not a process restart. Single-writer by design — the relay is
 * the only mutator, so held references are shared, not copied.
 */
export class InMemoryBoardStore implements BoardStore {
  private readonly boards = new Map<string, Paths>()
  private readonly maxBoards: number

  constructor(options: InMemoryBoardStoreOptions = {}) {
    this.maxBoards = options.maxBoards ?? 10_000
  }

  async load(boardId: string): Promise<Paths | undefined> {
    const paths = this.boards.get(boardId)
    if (paths !== undefined) this.touch(boardId, paths)
    return paths
  }

  async save(boardId: string, paths: Paths): Promise<void> {
    this.touch(boardId, paths)
    while (this.boards.size > this.maxBoards) {
      const coldest = this.boards.keys().next().value
      if (coldest === undefined) break
      this.boards.delete(coldest)
    }
  }

  /** Map iteration order is insertion order; re-inserting marks recency. */
  private touch(boardId: string, paths: Paths): void {
    this.boards.delete(boardId)
    this.boards.set(boardId, paths)
  }
}
