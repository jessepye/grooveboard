import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the whiteboard drawing surface', () => {
    const { container } = render(<App />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})
