import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Whiteboard } from './Whiteboard'

// Pin the canvas rect so a tap lands on the page in logical coords.
function pinCanvasRect(canvas: HTMLCanvasElement) {
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 1100, height: 850, right: 1100, bottom: 850, x: 0, y: 0, toJSON: () => {} }) as DOMRect
}

function drawDot() {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  pinCanvasRect(canvas)
  fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
  fireEvent.mouseUp(canvas)
}

describe('Whiteboard', () => {
  it('renders a drawing surface', () => {
    render(<Whiteboard />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('disables undo until something is drawn', () => {
    render(<Whiteboard />)
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    drawDot()
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
  })

  it('undo and redo walk the history snapshots', () => {
    render(<Whiteboard />)
    drawDot()
    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /redo/i })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: /redo/i }))
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /redo/i })).toBeDisabled()
  })

  it('selecting the eraser marks it active', () => {
    render(<Whiteboard />)
    const eraser = screen.getByRole('button', { name: /^eraser$/i })
    fireEvent.click(eraser)
    expect(eraser).toHaveAttribute('aria-pressed', 'true')
  })

  it('two-tap clear keeps the page in history (undo still available)', () => {
    render(<Whiteboard />)
    drawDot()
    const clear = screen.getByRole('button', { name: /clear page/i })
    fireEvent.click(clear) // arm
    fireEvent.click(clear) // confirm
    // History grew (draw + clear), so undo remains available.
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
  })
})
