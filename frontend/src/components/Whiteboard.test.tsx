import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CollabHandlers } from '../collab/useCollab'
import type { Stroke } from '../drawing/types'

// Capture the handlers Whiteboard registers, and expose spy senders, so we can
// drive both directions of the relay from the test.
const collab = vi.hoisted(() => ({
  handlers: {} as CollabHandlers,
  sendDraw: vi.fn(),
  sendErase: vi.fn(),
  sendClear: vi.fn(),
}))

vi.mock('../collab/useCollab', () => ({
  useCollab: (_board: string, handlers: CollabHandlers) => {
    collab.handlers = handlers
    return {
      connected: true,
      sendDraw: collab.sendDraw,
      sendErase: collab.sendErase,
      sendClear: collab.sendClear,
    }
  },
}))

// A stand-in canvas: shows how many strokes it was given and lets the test fire
// the commit/erase callbacks without real pointer/canvas plumbing.
const fakeStroke: Stroke = { id: 'x', tool: 'pen', color: '#000', size: 4, points: [] }
vi.mock('./DrawCanvas', () => ({
  default: (props: {
    strokes: Stroke[]
    onCommitStroke: (s: Stroke) => void
    onErase: (s: Stroke[]) => void
  }) => (
    <div>
      <span data-testid="stroke-count">{props.strokes.length}</span>
      <button onClick={() => props.onCommitStroke(fakeStroke)}>commit</button>
      <button onClick={() => props.onErase([])}>erase</button>
    </div>
  ),
}))

import Whiteboard from './Whiteboard'

const count = () => Number(screen.getByTestId('stroke-count').textContent)

beforeEach(() => {
  collab.sendDraw.mockClear()
  collab.sendErase.mockClear()
  collab.sendClear.mockClear()
})

describe('Whiteboard', () => {
  it('adds a committed stroke and broadcasts it', () => {
    render(<Whiteboard boardId="b" />)
    expect(count()).toBe(0)
    fireEvent.click(screen.getByText('commit'))
    expect(count()).toBe(1)
    expect(collab.sendDraw).toHaveBeenCalledWith({ page: 0, stroke: fakeStroke })
  })

  it('broadcasts an erasure as the surviving strokes', () => {
    render(<Whiteboard boardId="b" />)
    fireEvent.click(screen.getByText('commit'))
    fireEvent.click(screen.getByText('erase'))
    expect(count()).toBe(0)
    expect(collab.sendErase).toHaveBeenCalledWith({ page: 0, strokes: [] })
  })

  it('clears the page and broadcasts clear', () => {
    render(<Whiteboard boardId="b" />)
    fireEvent.click(screen.getByText('commit'))
    fireEvent.click(screen.getByRole('button', { name: /clear page/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
    expect(count()).toBe(0)
    expect(collab.sendClear).toHaveBeenCalledWith({ page: 0 })
  })

  it('renders a remote draw from a peer', () => {
    render(<Whiteboard boardId="b" />)
    fireEvent.click(screen.getByText('commit')) // local: 1
    act(() => collab.handlers.onDraw?.({ page: 0, stroke: { ...fakeStroke, id: 'remote' } }))
    expect(count()).toBe(2)
    // Remote events must not echo back out.
    expect(collab.sendDraw).toHaveBeenCalledTimes(1)
  })

  it('applies a remote clear from a peer', () => {
    render(<Whiteboard boardId="b" />)
    fireEvent.click(screen.getByText('commit'))
    act(() => collab.handlers.onClear?.({ page: 0 }))
    expect(count()).toBe(0)
  })

  it('replaces local paths with the state snapshot on join (replay)', () => {
    render(<Whiteboard boardId="b" />)
    act(() =>
      collab.handlers.onState?.({
        paths: { 0: [fakeStroke, { ...fakeStroke, id: 'y' }] },
      }),
    )
    expect(count()).toBe(2)
    // Replay is server-authoritative: it must not echo anything back out.
    expect(collab.sendDraw).not.toHaveBeenCalled()
    expect(collab.sendErase).not.toHaveBeenCalled()
  })
})
