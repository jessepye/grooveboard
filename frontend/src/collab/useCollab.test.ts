import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Stroke } from '../drawing/types'

// A fake socket whose registered handlers we can fire by hand.
const h = vi.hoisted(() => ({
  listeners: new Map<string, (payload: unknown) => void>(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  io: vi.fn(),
}))

vi.mock('socket.io-client', () => ({ io: h.io }))

import { useCollab } from './useCollab'

beforeEach(() => {
  h.listeners.clear()
  h.emit.mockClear()
  h.disconnect.mockClear()
  h.io.mockReset()
  h.io.mockReturnValue({
    on: (ev: string, cb: (p: unknown) => void) => h.listeners.set(ev, cb),
    off: (ev: string) => h.listeners.delete(ev),
    emit: h.emit,
    disconnect: h.disconnect,
  })
})

const fire = (event: string, payload: unknown) => {
  act(() => h.listeners.get(event)?.(payload))
}

const stroke: Stroke = { id: 'k', tool: 'pen', color: '#000', size: 4, points: [] }

describe('useCollab', () => {
  it('connects with the board id in the handshake query', () => {
    renderHook(() => useCollab('board-42', {}))
    expect(h.io).toHaveBeenCalledTimes(1)
    const [, opts] = h.io.mock.calls[0]
    expect(opts.query).toEqual({ board: 'board-42' })
  })

  it('routes incoming draw/erase/clear to the matching handler', () => {
    const onDraw = vi.fn()
    const onErase = vi.fn()
    const onClear = vi.fn()
    renderHook(() => useCollab('b', { onDraw, onErase, onClear }))

    fire('draw', { page: 0, stroke })
    fire('erase', { page: 1, strokes: [stroke] })
    fire('clear', { page: 2 })

    expect(onDraw).toHaveBeenCalledWith({ page: 0, stroke })
    expect(onErase).toHaveBeenCalledWith({ page: 1, strokes: [stroke] })
    expect(onClear).toHaveBeenCalledWith({ page: 2 })
  })

  it('routes the on-join state snapshot to onState', () => {
    const onState = vi.fn()
    renderHook(() => useCollab('b', { onState }))

    fire('state', { paths: { 0: [stroke] } })

    expect(onState).toHaveBeenCalledWith({ paths: { 0: [stroke] } })
  })

  it('emits draw/erase/clear with the protocol payloads', () => {
    const { result } = renderHook(() => useCollab('b', {}))
    act(() => result.current.sendDraw({ page: 0, stroke }))
    act(() => result.current.sendErase({ page: 0, strokes: [stroke] }))
    act(() => result.current.sendClear({ page: 0 }))

    expect(h.emit).toHaveBeenCalledWith('draw', { page: 0, stroke })
    expect(h.emit).toHaveBeenCalledWith('erase', { page: 0, strokes: [stroke] })
    expect(h.emit).toHaveBeenCalledWith('clear', { page: 0 })
  })

  it('tracks connection status', () => {
    const { result } = renderHook(() => useCollab('b', {}))
    expect(result.current.connected).toBe(false)
    fire('connect', undefined)
    expect(result.current.connected).toBe(true)
    fire('disconnect', undefined)
    expect(result.current.connected).toBe(false)
  })

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() => useCollab('b', {}))
    unmount()
    expect(h.disconnect).toHaveBeenCalledTimes(1)
  })
})
