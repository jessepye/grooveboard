import '@testing-library/jest-dom/vitest'

// jsdom ships no 2D canvas backend: getContext() throws "Not implemented".
// Stub it to return null so canvas paint code can guard on a falsy context
// instead of crashing the test run.
HTMLCanvasElement.prototype.getContext = () => null
