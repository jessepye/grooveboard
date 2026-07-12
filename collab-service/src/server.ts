// The Collaboration Service: a validating relay with board state. One
// socket.io room per board; draw/erase/clear events are validated, applied to
// the room's server-held state, and broadcast to everyone else in the room.
// Joining clients receive the current state as a `state` event, so a refresh
// or late join replays the board instead of starting blank.
//
// State lives in memory only while a room is occupied; the BoardStore seam is
// what it's loaded from on room open and saved to on every change (in-memory
// store for Phase 1, a durable store at deploy time).
//
// Board membership is decided once, at the handshake: the client passes
// `?board=<uuid>` and is joined to exactly that room. There is no join/leave
// event to abuse afterwards.

import { createServer, type Server as HttpServer } from 'node:http'
import { Server, type Socket } from 'socket.io'
import {
  DEFAULT_LIMITS,
  isValidBoardId,
  validateClear,
  validateDraw,
  validateErase,
  type Limits,
  type Paths,
  type Stroke,
} from './protocol.js'
import { TokenBucket } from './rateLimit.js'
import { InMemoryBoardStore, type BoardStore } from './store.js'

export interface CollabServerOptions {
  limits?: Partial<Limits>
  /** Origins allowed for the (unused-by-default) polling transport. */
  corsOrigin?: string | string[]
  /** Kill switch hook: return false to refuse all new connections. */
  acceptConnections?: () => boolean
  /** Persistence behind the relay; defaults to in-memory (lost on restart). */
  store?: BoardStore
}

export interface CollabServer {
  httpServer: HttpServer
  io: Server
  /** Start listening; resolves with the bound port (pass 0 for ephemeral). */
  listen(port: number): Promise<number>
  close(): Promise<void>
}

export function createCollabServer(options: CollabServerOptions = {}): CollabServer {
  const limits: Limits = { ...DEFAULT_LIMITS, ...options.limits }
  const store = options.store ?? new InMemoryBoardStore()

  const httpServer = createServer((req, res) => {
    // socket.io intercepts its own /socket.io/ routes before this handler.
    if (req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end('ok')
      return
    }
    res.writeHead(404)
    res.end()
  })

  const io = new Server(httpServer, {
    maxHttpBufferSize: limits.maxPayloadBytes,
    cors: { origin: options.corsOrigin ?? false },
  })

  const connectionsPerIp = new Map<string, number>()

  // Live state for occupied rooms. The value is a promise while the first
  // joiner's store.load is in flight, so simultaneous joins share one load.
  const roomPaths = new Map<string, Paths | Promise<Paths>>()

  async function openRoom(board: string): Promise<Paths> {
    const existing = roomPaths.get(board)
    if (existing !== undefined) return existing
    const loading = store.load(board).then(loaded => {
      const paths = loaded ?? {}
      roomPaths.set(board, paths)
      return paths
    })
    roomPaths.set(board, loading)
    return loading
  }

  io.use((socket, next) => {
    if (options.acceptConnections && !options.acceptConnections()) {
      return next(new Error('service unavailable'))
    }
    const board = socket.handshake.query.board
    if (typeof board !== 'string' || !isValidBoardId(board)) {
      return next(new Error('invalid board id'))
    }
    if ((connectionsPerIp.get(socket.handshake.address) ?? 0) >= limits.maxConnectionsPerIp) {
      return next(new Error('too many connections'))
    }
    next()
  })

  io.on('connection', async (socket: Socket) => {
    const board = socket.handshake.query.board as string
    const ip = socket.handshake.address
    connectionsPerIp.set(ip, (connectionsPerIp.get(ip) ?? 0) + 1)
    socket.join(board)

    socket.on('disconnect', () => {
      const remaining = (connectionsPerIp.get(ip) ?? 1) - 1
      if (remaining <= 0) connectionsPerIp.delete(ip)
      else connectionsPerIp.set(ip, remaining)
      // Last one out: drop the live copy. The store keeps the durable one.
      if (io.sockets.adapter.rooms.get(board) === undefined) roomPaths.delete(board)
    })

    const paths = await openRoom(board)
    socket.emit('state', { paths })

    const bucket = new TokenBucket({ capacity: limits.rateBurst, refillPerSec: limits.ratePerSec })

    // Validate -> apply to room state -> relay to peers -> persist. `accept`
    // returns false for anything that must be dropped (malformed, over caps).
    const relay = (event: string, accept: (payload: never) => boolean) => {
      socket.on(event, (payload: unknown) => {
        if (!bucket.take()) return // over rate: drop, don't relay
        if (!accept(payload as never)) return
        socket.to(board).emit(event, payload)
        void store.save(board, paths).catch(() => {}) // fire-and-forget
      })
    }

    relay('draw', (p: { page: number; stroke: Stroke }) => {
      if (!validateDraw(p, limits)) return false
      const strokes = (paths[p.page] ??= [])
      if (strokes.length >= limits.maxStrokesPerPage) return false // page full
      strokes.push(p.stroke)
      return true
    })
    relay('erase', (p: { page: number; strokes: Stroke[] }) => {
      if (!validateErase(p, limits)) return false
      paths[p.page] = p.strokes
      return true
    })
    relay('clear', (p: { page: number }) => {
      if (!validateClear(p)) return false
      paths[p.page] = []
      return true
    })
  })

  return {
    httpServer,
    io,
    listen(port: number) {
      return new Promise((resolve, reject) => {
        httpServer.once('error', reject)
        httpServer.listen(port, () => {
          const address = httpServer.address()
          if (address === null || typeof address === 'string') {
            return reject(new Error('expected a TCP address'))
          }
          resolve(address.port)
        })
      })
    },
    close() {
      return new Promise(resolve => {
        // io.close() also closes the underlying HTTP server.
        io.close(() => resolve())
      })
    },
  }
}
