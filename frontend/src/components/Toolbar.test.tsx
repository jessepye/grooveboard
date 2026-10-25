import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Toolbar from './Toolbar'

function setup(overrides: Partial<React.ComponentProps<typeof Toolbar>> = {}) {
  const props = {
    tool: 'pen' as const,
    setTool: vi.fn(),
    toolColors: { pen: '#2A2118', highlighter: '#F8E16C' },
    setColor: vi.fn(),
    size: 4,
    setSize: vi.fn(),
    eraserMode: 'stroke' as const,
    setEraserMode: vi.fn(),
    onClearPage: vi.fn(),
    ...overrides,
  }
  const utils = render(<Toolbar {...props} />)
  return { props, ...utils }
}

const toolButton = (name: RegExp) => screen.getByRole('button', { name })

describe('Toolbar — tool selection', () => {
  it('offers pen, highlighter, and eraser', () => {
    setup()
    expect(toolButton(/^pen$/i)).toBeInTheDocument()
    expect(toolButton(/^highlighter$/i)).toBeInTheDocument()
    expect(toolButton(/^eraser$/i)).toBeInTheDocument()
  })

  it('selects a different tool on click', () => {
    const { props } = setup()
    fireEvent.click(toolButton(/^highlighter$/i))
    expect(props.setTool).toHaveBeenCalledWith('highlighter')
  })

  it('marks the active tool as pressed', () => {
    setup({ tool: 'eraser' })
    expect(toolButton(/^eraser$/i)).toHaveAttribute('aria-pressed', 'true')
    expect(toolButton(/^pen$/i)).toHaveAttribute('aria-pressed', 'false')
  })

  it("shows each ink tool's own color under its icon", () => {
    setup({ tool: 'pen', toolColors: { pen: '#F25B3A', highlighter: '#F8E16C' } })
    const bar = (name: RegExp) => toolButton(name).querySelector('.gb-tool-color')
    expect(bar(/^pen$/i)).toHaveStyle({ background: '#F25B3A' })
    expect(bar(/^highlighter$/i)).toHaveStyle({ background: '#F8E16C' })
  })

  it('docks at the requested edge', () => {
    setup({ position: 'left' })
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-position', 'left')
  })
})

describe('Toolbar — color + size popover', () => {
  it('stays closed until the active color tool is tapped again', () => {
    setup({ tool: 'pen' })
    expect(screen.queryByRole('button', { name: /color tomato/i })).not.toBeInTheDocument()
    fireEvent.click(toolButton(/^pen$/i))
    expect(screen.getByRole('button', { name: /color tomato/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /size/i })).toBeInTheDocument()
  })

  it('toggles closed when tapped again', () => {
    setup({ tool: 'pen' })
    fireEvent.click(toolButton(/^pen$/i))
    fireEvent.click(toolButton(/^pen$/i))
    expect(screen.queryByRole('button', { name: /color tomato/i })).not.toBeInTheDocument()
  })

  it('picks a color and closes the popover', () => {
    const { props } = setup({ tool: 'pen' })
    fireEvent.click(toolButton(/^pen$/i))
    fireEvent.click(screen.getByRole('button', { name: /color tomato/i }))
    expect(props.setColor).toHaveBeenCalledWith('#F25B3A')
    expect(screen.queryByRole('button', { name: /color tomato/i })).not.toBeInTheDocument()
  })

  it('marks the current color as pressed', () => {
    setup({ tool: 'pen', toolColors: { pen: '#F25B3A', highlighter: '#F8E16C' } })
    fireEvent.click(toolButton(/^pen$/i))
    expect(screen.getByRole('button', { name: /color tomato/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('changes the brush size from the slider', () => {
    const { props } = setup({ tool: 'pen' })
    fireEvent.click(toolButton(/^pen$/i))
    fireEvent.change(screen.getByRole('slider', { name: /size/i }), {
      target: { value: '12' },
    })
    expect(props.setSize).toHaveBeenCalledWith(12)
  })

  it('closes when the parent switches tools', () => {
    const { props, rerender } = setup({ tool: 'pen' })
    fireEvent.click(toolButton(/^pen$/i))
    rerender(<Toolbar {...props} tool="highlighter" />)
    expect(screen.queryByRole('button', { name: /color tomato/i })).not.toBeInTheDocument()
  })
})

describe('Toolbar — eraser modes', () => {
  it('opens the eraser modes when switching to the eraser', () => {
    const { props, rerender } = setup({ tool: 'pen' })
    fireEvent.click(toolButton(/^eraser$/i))
    expect(props.setTool).toHaveBeenCalledWith('eraser')
    rerender(<Toolbar {...props} tool="eraser" />) // the parent applies the switch
    expect(screen.getByRole('group', { name: /eraser mode/i })).toBeInTheDocument()
  })

  it('selects a mode and closes the popover', () => {
    const { props } = setup({ tool: 'eraser', eraserMode: 'stroke' })
    fireEvent.click(toolButton(/^eraser$/i)) // re-tap the active eraser
    const modes = screen.getByRole('group', { name: /eraser mode/i })
    fireEvent.click(within(modes).getByRole('button', { name: /pixel eraser/i }))
    expect(props.setEraserMode).toHaveBeenCalledWith('pixel')
    expect(screen.queryByRole('group', { name: /eraser mode/i })).not.toBeInTheDocument()
  })

  it('marks the current mode as pressed', () => {
    setup({ tool: 'eraser', eraserMode: 'pixel' })
    fireEvent.click(toolButton(/^eraser$/i))
    const modes = screen.getByRole('group', { name: /eraser mode/i })
    expect(within(modes).getByRole('button', { name: /pixel eraser/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})

describe('Toolbar — clear page', () => {
  it('requires two taps to clear the page', () => {
    const { props } = setup()
    fireEvent.click(screen.getByRole('button', { name: /clear page/i }))
    expect(props.onClearPage).not.toHaveBeenCalled() // first tap only arms it
    fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
    expect(props.onClearPage).toHaveBeenCalledTimes(1)
  })
})
