import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Toolbar, type ToolbarProps } from './Toolbar'

function setup(overrides: Partial<ToolbarProps> = {}) {
  const props: ToolbarProps = {
    tool: 'pen',
    setTool: vi.fn(),
    color: '#1F1D1A',
    setColor: vi.fn(),
    size: 4,
    setSize: vi.fn(),
    eraserMode: 'pixel',
    setEraserMode: vi.fn(),
    onClearPage: vi.fn(),
    ...overrides,
  }
  render(<Toolbar {...props} />)
  return props
}

describe('Toolbar — tool selection', () => {
  it('marks the active tool as pressed', () => {
    setup({ tool: 'pen' })
    expect(screen.getByRole('button', { name: /^pen$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /highlighter/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects a different tool on click', () => {
    const props = setup({ tool: 'pen' })
    fireEvent.click(screen.getByRole('button', { name: /highlighter/i }))
    expect(props.setTool).toHaveBeenCalledWith('highlighter')
  })
})

describe('Toolbar — color popover', () => {
  it('opens the color + size popover when re-clicking the active color tool', () => {
    setup({ tool: 'pen' })
    expect(screen.queryByRole('button', { name: /color tomato/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^pen$/i }))
    expect(screen.getByRole('button', { name: /color tomato/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /size/i })).toBeInTheDocument()
  })

  it('picks a color and closes the popover', () => {
    const props = setup({ tool: 'pen' })
    fireEvent.click(screen.getByRole('button', { name: /^pen$/i }))
    fireEvent.click(screen.getByRole('button', { name: /color tomato/i }))
    expect(props.setColor).toHaveBeenCalledWith('#F25B3A')
    expect(screen.queryByRole('button', { name: /color tomato/i })).not.toBeInTheDocument()
  })

  it('adjusts the brush size from the slider', () => {
    const props = setup({ tool: 'pen' })
    fireEvent.click(screen.getByRole('button', { name: /^pen$/i }))
    fireEvent.change(screen.getByRole('slider', { name: /size/i }), { target: { value: '12' } })
    expect(props.setSize).toHaveBeenCalledWith(12)
  })
})

describe('Toolbar — eraser modes', () => {
  it('opens the eraser mode popover and selects whole-stroke', () => {
    const props = setup({ tool: 'eraser', eraserMode: 'pixel' })
    fireEvent.click(screen.getByRole('button', { name: /^eraser$/i }))
    const popover = screen.getByRole('group', { name: /eraser/i })
    fireEvent.click(within(popover).getByRole('button', { name: /whole stroke/i }))
    expect(props.setEraserMode).toHaveBeenCalledWith('stroke')
  })
})

describe('Toolbar — clear page', () => {
  it('requires two taps to confirm a clear', () => {
    const props = setup()
    const clear = screen.getByRole('button', { name: /clear page/i })
    fireEvent.click(clear)
    expect(props.onClearPage).not.toHaveBeenCalled()
    fireEvent.click(clear)
    expect(props.onClearPage).toHaveBeenCalledTimes(1)
  })
})
