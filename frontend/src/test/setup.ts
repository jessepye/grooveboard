import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement the canvas 2D context and logs a noisy "Not
// implemented" error every time getContext is called. Our canvas code guards on
// a null context, so stub it to return null quietly.
HTMLCanvasElement.prototype.getContext =
  (() => null) as typeof HTMLCanvasElement.prototype.getContext
