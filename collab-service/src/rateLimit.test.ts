// Token bucket: a connection gets `capacity` tokens for bursts and regains
// `refillPerSec` tokens per second. Time is injected so tests are exact.

import { describe, expect, it } from 'vitest'
import { TokenBucket } from './rateLimit.js'

describe('TokenBucket', () => {
  it('allows a full burst up to capacity, then rejects', () => {
    const bucket = new TokenBucket({ capacity: 3, refillPerSec: 1 }, 0)
    expect(bucket.take(0)).toBe(true)
    expect(bucket.take(0)).toBe(true)
    expect(bucket.take(0)).toBe(true)
    expect(bucket.take(0)).toBe(false)
  })

  it('refills over time at refillPerSec', () => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSec: 10 }, 0)
    bucket.take(0)
    bucket.take(0)
    expect(bucket.take(0)).toBe(false)
    // 100ms at 10 tokens/sec = 1 token back
    expect(bucket.take(100)).toBe(true)
    expect(bucket.take(100)).toBe(false)
  })

  it('never refills beyond capacity', () => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSec: 1000 }, 0)
    // A long quiet period must not bank unlimited burst.
    expect(bucket.take(60_000)).toBe(true)
    expect(bucket.take(60_000)).toBe(true)
    expect(bucket.take(60_000)).toBe(false)
  })
})
