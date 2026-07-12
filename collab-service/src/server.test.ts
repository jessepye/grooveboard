// Integration tests: a real server on an ephemeral port, real socket.io
// clients. These pin down the relay's observable contract — who receives
// what, and which abuse cases are refused or silently dropped.

import { afterEach, describe, expect, it } from 'vitest'
import { io, type Socket } from 'socket.io-client'
import { createCollabServer, type CollabServer, type CollabServerOptions } from './server.js'

const BOARD_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const BOARD_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

const drawEvent = (n = 0) => ({
  page: 0,
  stroke: {
    id: `s${n}`,
    tool: 'pen',
    points: [
      { x: n, y: 0 },
      { x: n, y: 1 },
    ],
    color: '#2A2118',
    size: 4,
  },
})

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

let server: CollabServer | undefined
const clients: Socket[] = []

async function startServer(opts?: CollabServerOptions): Promise<number> {
  server = createCollabServer(opts)
  return server.listen(0)
}

function connect(port: number, board?: string): Promise<Socket> {
  const socket = io(`http://127.0.0.1:${port}`, {
    transports: ['websocket'],
    reconnection: false,
    query: board === undefined ? {} : { board },
  })
  clients.push(socket)
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket))
    socket.on('connect_error', err => reject(err))
  })
}

function received<T>(socket: Socket, event: string): T[] {
  const seen: T[] = []
  socket.on(event, (e: T) => seen.push(e))
  return seen
}

afterEach(async () => {
  for (const c of clients) c.disconnect()
  clients.length = 0
  await server?.close()
  server = undefined
})

describe('relaying', () => {
  it('relays draw to peers on the same board but not back to the sender', async () => {
    const port = await startServer()
    const [alice, bob] = await Promise.all([connect(port, BOARD_A), connect(port, BOARD_A)])
    const bobSaw = received(bob, 'draw')
    const aliceSaw = received(alice, 'draw')

    alice.emit('draw', drawEvent())
    await sleep(100)

    expect(bobSaw).toEqual([drawEvent()])
    expect(aliceSaw).toEqual([])
  })

  it('does not relay across boards', async () => {
    const port = await startServer()
    const [alice, eve] = await Promise.all([connect(port, BOARD_A), connect(port, BOARD_B)])
    const eveSaw = received(eve, 'draw')

    alice.emit('draw', drawEvent())
    await sleep(100)

    expect(eveSaw).toEqual([])
  })

  it('relays erase and clear', async () => {
    const port = await startServer()
    const [alice, bob] = await Promise.all([connect(port, BOARD_A), connect(port, BOARD_A)])
    const erases = received(bob, 'erase')
    const clears = received(bob, 'clear')

    alice.emit('erase', { page: 0, strokes: [drawEvent().stroke] })
    alice.emit('clear', { page: 0 })
    await sleep(100)

    expect(erases).toEqual([{ page: 0, strokes: [drawEvent().stroke] }])
    expect(clears).toEqual([{ page: 0 }])
  })
})

describe('connection policy', () => {
  it('rejects a connection with no board id', async () => {
    const port = await startServer()
    await expect(connect(port)).rejects.toThrow(/board/i)
  })

  it('rejects a malformed board id (rooms must not be enumerable/spoofable)', async () => {
    const port = await startServer()
    await expect(connect(port, 'lobby')).rejects.toThrow(/board/i)
  })

  it('caps concurrent connections per IP', async () => {
    const port = await startServer({ limits: { maxConnectionsPerIp: 2 } })
    await connect(port, BOARD_A)
    await connect(port, BOARD_A)
    await expect(connect(port, BOARD_A)).rejects.toThrow(/too many/i)
  })

  it('frees per-IP slots when a connection closes', async () => {
    const port = await startServer({ limits: { maxConnectionsPerIp: 1 } })
    const first = await connect(port, BOARD_A)
    first.disconnect()
    await sleep(100)
    await expect(connect(port, BOARD_A)).resolves.toBeDefined()
  })

  it('refuses new connections when the kill switch is on', async () => {
    const port = await startServer({ acceptConnections: () => false })
    await expect(connect(port, BOARD_A)).rejects.toThrow(/unavailable/i)
  })
})

describe('abuse limits', () => {
  it('drops (does not relay) a stroke with too many points', async () => {
    const port = await startServer({ limits: { maxPointsPerStroke: 5 } })
    const [alice, bob] = await Promise.all([connect(port, BOARD_A), connect(port, BOARD_A)])
    const bobSaw = received(bob, 'draw')

    const fat = drawEvent()
    fat.stroke.points = Array.from({ length: 6 }, (_, i) => ({ x: i, y: i }))
    alice.emit('draw', fat)
    alice.emit('draw', drawEvent(1)) // sanity: valid traffic still flows
    await sleep(100)

    expect(bobSaw).toEqual([drawEvent(1)])
  })

  it('drops malformed payloads without disturbing the connection', async () => {
    const port = await startServer()
    const [alice, bob] = await Promise.all([connect(port, BOARD_A), connect(port, BOARD_A)])
    const bobSaw = received(bob, 'draw')

    alice.emit('draw', { page: 0, stroke: { points: 'not an array' } })
    alice.emit('draw', 'garbage')
    alice.emit('draw', drawEvent(1))
    await sleep(100)

    expect(bobSaw).toEqual([drawEvent(1)])
    expect(alice.connected).toBe(true)
  })

  it('rate-limits a flooding connection (burst beyond bucket is dropped)', async () => {
    const port = await startServer({ limits: { rateBurst: 3, ratePerSec: 1 } })
    const [alice, bob] = await Promise.all([connect(port, BOARD_A), connect(port, BOARD_A)])
    const bobSaw = received(bob, 'draw')

    for (let i = 0; i < 20; i++) alice.emit('draw', drawEvent(i))
    await sleep(150)

    expect(bobSaw.length).toBe(3)
  })
})
