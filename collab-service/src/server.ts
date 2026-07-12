// The Collaboration Service: a dumb relay. One socket.io room per board;
// draw/erase/clear events are validated and broadcast to everyone else in the
// room. It holds no board state, so restarts lose nothing (clients keep their
// own strokes and reconnect).
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
} from './protocol.js'
import { TokenBucket } from './rateLimit.js'

export interface CollabServerOptions {
  limits?: Partial<Limits>
  /** Origins allowed for the (unused-by-default) polling transport. */
  corsOrigin?: string | string[]
  /** Kill switch hook: return false to refuse all new connections. */
  acceptConnections?: () => boolean
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

  io.on('connection', (socket: Socket) => {
    const board = socket.handshake.query.board as string
    const ip = socket.handshake.address
    connectionsPerIp.set(ip, (connectionsPerIp.get(ip) ?? 0) + 1)
    socket.join(board)

    const bucket = new TokenBucket({ capacity: limits.rateBurst, refillPerSec: limits.ratePerSec })

    const relay = (event: string, isValid: (payload: unknown) => boolean) => {
      socket.on(event, (payload: unknown) => {
        if (!bucket.take()) return // over rate: drop, don't relay
        if (!isValid(payload)) return // malformed/oversized: drop, don't relay
        socket.to(board).emit(event, payload)
      })
    }

    relay('draw', p => validateDraw(p, limits))
    relay('erase', p => validateErase(p, limits))
    relay('clear', validateClear)

    socket.on('disconnect', () => {
      const remaining = (connectionsPerIp.get(ip) ?? 1) - 1
      if (remaining <= 0) connectionsPerIp.delete(ip)
      else connectionsPerIp.set(ip, remaining)
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
