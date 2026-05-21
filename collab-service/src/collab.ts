// Collaboration Service — the WebSocket relay.
//
// Phase 1 scope (see docs/roadmap.md): a dumb, stateless relay. Clients connect
// with a board id and the server broadcasts their drawing events to every other
// client on that same board. No persistence; boards are ephemeral.

import type { Server as HttpServer } from 'node:http'
import { Server, type Socket } from 'socket.io'

/** Events relayed verbatim to peers on the same board. */
export const RELAYED_EVENTS = ['draw', 'erase', 'clear'] as const
export type RelayedEvent = (typeof RELAYED_EVENTS)[number]

/** Pull the board id out of the connection handshake query (`?board=...`). */
function boardIdFrom(socket: Socket): string | null {
  const raw = socket.handshake.query.board
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Wire up a single connection: join its board room and relay drawing events to
 * the rest of that room (the sender is excluded by `socket.to(room)`). A
 * connection with no board id is rejected — there's nowhere to route it.
 */
export function registerSocket(socket: Socket): void {
  const board = boardIdFrom(socket)
  if (!board) {
    socket.disconnect(true)
    return
  }
  void socket.join(board)
  for (const event of RELAYED_EVENTS) {
    socket.on(event, (payload: unknown) => {
      socket.to(board).emit(event, payload)
    })
  }
}

/** Attach a Socket.IO server to an existing HTTP server and start relaying. */
export function attachCollab(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    // Anonymous boards are link-shared from any origin in Phase 1.
    // Tighten this once the frontend's deployed origin is known.
    cors: { origin: '*' },
  })
  io.on('connection', registerSocket)
  return io
}
