import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Socket.IO integration tests bind real ports — keep them serial and
    // give generous timeouts for connect/handshake round-trips.
    fileParallelism: false,
    testTimeout: 10000,
  },
})
