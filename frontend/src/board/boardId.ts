// Resolve which board the current page is editing. Board ids are random UUIDs
// (unguessable, never sequential) so the relay's rooms can't be enumerated —
// see docs/todo.md → Risks ("Use unguessable board IDs").

export interface ResolvedBoard {
  boardId: string
  /** True when a fresh id was minted (caller should reflect it in the URL). */
  created: boolean
}

export function resolveBoardId(search: string): ResolvedBoard {
  const existing = new URLSearchParams(search).get('board')
  if (existing) return { boardId: existing, created: false }
  return { boardId: crypto.randomUUID(), created: true }
}
