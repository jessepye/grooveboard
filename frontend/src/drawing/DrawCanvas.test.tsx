import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DrawCanvas, type DrawCanvasProps } from './DrawCanvas'
import type { Paths, Stroke } from './types'

// jsdom has no 2D canvas backend, so getContext returns null and
// getBoundingClientRect reports zeros — pin the rect so toLocal is predictable.
function setup(overrides: Partial<DrawCanvasProps> = {}) {
  const onPathsChange = vi.fn<(next: Paths) => void>()
  const props: DrawCanvasProps = {
    tool: 'pen',
    eraserMode: 'pixel',
    color: '#1F1D1A',
    size: 4,
    paths: {},
    onPathsChange,
    page: 0,
    pageW: 1100,
    pageH: 850,
    scale: 1,
    ...overrides,
  }
  const { container } = render(<DrawCanvas {...props} />)
  const canvas = container.querySelector('canvas') as HTMLCanvasElement
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 1100, height: 850, right: 1100, bottom: 850, x: 0, y: 0, toJSON: () => {} }) as DOMRect
  return { canvas, onPathsChange }
}

describe('DrawCanvas — pen', () => {
  it('commits a stroke with the dragged points on mouse up', () => {
    const { canvas, onPathsChange } = setup()
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 20 })
    fireEvent.mouseMove(canvas, { clientX: 30, clientY: 40 })
    fireEvent.mouseUp(canvas)

    expect(onPathsChange).toHaveBeenCalled()
    const calls = onPathsChange.mock.calls
    const next = calls[calls.length - 1][0]
    const committed = next[0]
    expect(committed).toHaveLength(1)
    const stroke = committed[0] as Stroke
    expect(stroke.tool).toBe('pen')
    expect(stroke.color).toBe('#1F1D1A')
    expect(stroke.points).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ])
  })

  it('converts client coords to logical page coords using scale', () => {
    const { canvas, onPathsChange } = setup({ scale: 0.5 })
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 20 })
    fireEvent.mouseUp(canvas)
    const calls = onPathsChange.mock.calls
    const stroke = calls[calls.length - 1][0][0][0] as Stroke
    expect(stroke.points[0]).toEqual({ x: 20, y: 40 })
  })

  it('does not draw with a non-drawing tool', () => {
    const { canvas, onPathsChange } = setup({ tool: 'shape' })
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 20 })
    fireEvent.mouseUp(canvas)
    expect(onPathsChange).not.toHaveBeenCalled()
  })
})

describe('DrawCanvas — stroke eraser', () => {
  const crossing = (): Stroke => ({
    id: 'a',
    tool: 'pen',
    color: '#000',
    size: 4,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  })

  it('removes a stroke tapped under it', () => {
    const paths: Paths = { 0: [crossing()] }
    const { canvas, onPathsChange } = setup({ tool: 'eraser', eraserMode: 'stroke', paths })
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 1 })
    expect(onPathsChange).toHaveBeenCalledWith({ 0: [] })
  })

  it('leaves strokes that are not under the cursor', () => {
    const paths: Paths = { 0: [crossing()] }
    const { canvas, onPathsChange } = setup({ tool: 'eraser', eraserMode: 'stroke', paths })
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 400 })
    expect(onPathsChange).not.toHaveBeenCalled()
  })
})
