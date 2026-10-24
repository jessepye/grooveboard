import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DrawCanvas from './DrawCanvas'
import type { Stroke } from '../drawing/types'

// jsdom has no 2D context; the component guards on a null ctx, so a redraw is a
// no-op here and we assert on the callbacks instead of pixels.

function setup(props: Partial<React.ComponentProps<typeof DrawCanvas>> = {}) {
  const onCommitStroke = vi.fn()
  const onErase = vi.fn()
  const utils = render(
    <DrawCanvas
      tool="pen"
      color="#F25B3A"
      size={4}
      strokes={[]}
      scale={1}
      width={1100}
      height={850}
      onCommitStroke={onCommitStroke}
      onErase={onErase}
      {...props}
    />,
  )
  const canvas = utils.container.querySelector('canvas') as HTMLCanvasElement
  return { canvas, onCommitStroke, onErase }
}

describe('DrawCanvas — pen', () => {
  it('commits a stroke after press, move, release', () => {
    const { canvas, onCommitStroke } = setup()
    fireEvent.mouseDown(canvas, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(canvas, { clientX: 10, clientY: 12 })
    fireEvent.mouseUp(canvas)

    expect(onCommitStroke).toHaveBeenCalledTimes(1)
    const stroke: Stroke = onCommitStroke.mock.calls[0][0]
    expect(stroke.tool).toBe('pen')
    expect(stroke.color).toBe('#F25B3A')
    expect(stroke.points.length).toBeGreaterThanOrEqual(2)
    expect(stroke.points[0]).toEqual({ x: 0, y: 0 })
  })

  it('does not commit a stroke for a bare click with no movement', () => {
    const { canvas, onCommitStroke } = setup()
    fireEvent.mouseDown(canvas, { clientX: 5, clientY: 5 })
    fireEvent.mouseUp(canvas)
    // A single point is not a stroke worth broadcasting.
    expect(onCommitStroke).not.toHaveBeenCalled()
  })

  it('maps client coordinates through the active scale', () => {
    const { canvas, onCommitStroke } = setup({ scale: 2 })
    fireEvent.mouseDown(canvas, { clientX: 20, clientY: 40 })
    fireEvent.mouseMove(canvas, { clientX: 30, clientY: 60 })
    fireEvent.mouseUp(canvas)
    const stroke: Stroke = onCommitStroke.mock.calls[0][0]
    expect(stroke.points[0]).toEqual({ x: 10, y: 20 }) // 20/2, 40/2
  })
})

describe('DrawCanvas — eraser', () => {
  const horizontal: Stroke = {
    id: 'h',
    tool: 'pen',
    color: '#000',
    size: 4,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  }

  it('removes a stroke on contact and reports the survivors', () => {
    const { canvas, onErase } = setup({ tool: 'eraser', strokes: [horizontal] })
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 0 })
    expect(onErase).toHaveBeenCalledWith([])
  })

  it('does nothing when erasing empty space', () => {
    const { canvas, onErase } = setup({ tool: 'eraser', strokes: [horizontal] })
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 400 })
    expect(onErase).not.toHaveBeenCalled()
  })
})
