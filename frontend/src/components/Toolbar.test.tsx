import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Toolbar from './Toolbar'

function setup(overrides: Partial<React.ComponentProps<typeof Toolbar>> = {}) {
  const props = {
    tool: 'pen' as const,
    setTool: vi.fn(),
    color: '#2A2118',
    setColor: vi.fn(),
    size: 4,
    setSize: vi.fn(),
    onClearPage: vi.fn(),
    ...overrides,
  }
  render(<Toolbar {...props} />)
  return props
}

describe('Toolbar', () => {
  it('selects tools', () => {
    const { setTool } = setup()
    fireEvent.click(screen.getByRole('button', { name: /eraser/i }))
    expect(setTool).toHaveBeenCalledWith('eraser')
  })

  it('marks the active tool as pressed', () => {
    setup({ tool: 'eraser' })
    expect(screen.getByRole('button', { name: /eraser/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^pen/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('picks a color', () => {
    const { setColor } = setup()
    fireEvent.click(screen.getByRole('button', { name: /color tomato/i }))
    expect(setColor).toHaveBeenCalledWith('#F25B3A')
  })

  it('changes the brush size', () => {
    const { setSize } = setup()
    fireEvent.change(screen.getByRole('slider', { name: /size/i }), {
      target: { value: '12' },
    })
    expect(setSize).toHaveBeenCalledWith(12)
  })

  it('requires two taps to clear the page', () => {
    const { onClearPage } = setup()
    const clear = screen.getByRole('button', { name: /clear page/i })
    fireEvent.click(clear)
    expect(onClearPage).not.toHaveBeenCalled() // first tap only arms it
    fireEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
    expect(onClearPage).toHaveBeenCalledTimes(1)
  })
})
