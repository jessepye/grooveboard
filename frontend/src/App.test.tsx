import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Whiteboard opens a real socket; stub it and surface the board id it receives.
vi.mock('./components/Whiteboard', () => ({
  default: ({ boardId }: { boardId: string }) => (
    <div data-testid="board">{boardId}</div>
  ),
}))

import App from './App'

describe('App', () => {
  it('mounts the whiteboard with a resolved board id', () => {
    render(<App />)
    expect(screen.getByTestId('board').textContent).toBeTruthy()
  })

  it('reflects a freshly minted board id in the URL', () => {
    render(<App />)
    expect(new URL(window.location.href).searchParams.get('board')).toBeTruthy()
  })
})
