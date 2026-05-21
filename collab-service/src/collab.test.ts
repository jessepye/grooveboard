import { createServer, type Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type Socket as ClientSocket, io as ioc } from 'socket.io-client'
import type { Server as IOServer } from 'socket.io'
import { attachCollab } from './collab.js'

let httpServer: HttpServer
let io: IOServer
let port: number
const clients: ClientSocket[] = []

beforeEach(async () => {
  httpServer = createServer()
  io = attachCollab(httpServer)
  await new Promise<void>(resolve => httpServer.listen(0, resolve))
  port = (httpServer.address() as AddressInfo).port
})

afterEach(async () => {
  for (const c of clients.splice(0)) c.disconnect()
  await io.close()
  await new Promise<void>(resolve => httpServer.close(() => resolve()))
})

/** Connect a client to a board and resolve once it's connected. */
function connect(board?: string): Promise<ClientSocket> {
  const query = board === undefined ? {} : { board }
  const socket = ioc(`http://localhost:${port}`, {
    transports: ['websocket'],
    forceNew: true,
    query,
  })
  clients.push(socket)
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket))
    socket.on('connect_error', reject)
  })
}

/** Resolve with the next payload for `event`. */
function next<T = unknown>(socket: ClientSocket, event: string): Promise<T> {
  return new Promise(resolve => socket.once(event, (payload: T) => resolve(payload)))
}

/** Resolve true if `event` does NOT arrive within `ms`. */
function silentFor(socket: ClientSocket, event: string, ms = 150): Promise<boolean> {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      socket.off(event)
      resolve(true)
    }, ms)
    socket.once(event, () => {
      clearTimeout(timer)
      resolve(false)
    })
  })
}

const sampleStroke = {
  id: 'k1',
  tool: 'pen',
  color: '#1F1D1A',
  size: 4,
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ],
}

describe('collab relay', () => {
  it('relays draw events to other peers on the same board', async () => {
    const [a, b] = await Promise.all([connect('board-1'), connect('board-1')])
    const received = next(b, 'draw')
    a.emit('draw', { page: 0, stroke: sampleStroke })
    await expect(received).resolves.toEqual({ page: 0, stroke: sampleStroke })
  })

  it('does not echo the event back to the sender', async () => {
    const [a, b] = await Promise.all([connect('board-1'), connect('board-1')])
    void b // b just keeps the room populated
    const echoed = silentFor(a, 'draw')
    a.emit('draw', { page: 0, stroke: sampleStroke })
    await expect(echoed).resolves.toBe(true)
  })

  it('isolates boards — peers on a different board do not receive', async () => {
    const [a] = await Promise.all([connect('board-1')])
    const other = await connect('board-2')
    const leaked = silentFor(other, 'draw')
    a.emit('draw', { page: 0, stroke: sampleStroke })
    await expect(leaked).resolves.toBe(true)
  })

  it('relays erase events (updated strokes for a page)', async () => {
    const [a, b] = await Promise.all([connect('board-1'), connect('board-1')])
    const received = next(b, 'erase')
    const payload = { page: 0, strokes: [sampleStroke] }
    a.emit('erase', payload)
    await expect(received).resolves.toEqual(payload)
  })

  it('relays clear events', async () => {
    const [a, b] = await Promise.all([connect('board-1'), connect('board-1')])
    const received = next(b, 'clear')
    a.emit('clear', { page: 0 })
    await expect(received).resolves.toEqual({ page: 0 })
  })

  it('disconnects clients that connect without a board id', async () => {
    const socket = ioc(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
    })
    clients.push(socket)
    // The server tears down a board-less connection, possibly right after the
    // handshake — so assert the end state rather than racing connect/disconnect.
    const rejected = await new Promise<boolean>(resolve => {
      socket.on('disconnect', () => resolve(true))
      setTimeout(() => resolve(!socket.connected), 500)
    })
    expect(rejected).toBe(true)
  })
})
