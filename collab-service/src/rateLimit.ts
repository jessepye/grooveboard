// Per-connection token bucket. Chosen over a fixed window because drawing is
// legitimately bursty: an eraser sweep emits an event per mousemove (~60/sec)
// for a moment, then goes quiet. The bucket absorbs the burst; the refill rate
// bounds sustained throughput.

export interface TokenBucketOptions {
  capacity: number
  refillPerSec: number
}

export class TokenBucket {
  private tokens: number
  private lastRefillMs: number

  constructor(
    private readonly opts: TokenBucketOptions,
    nowMs: number = Date.now(),
  ) {
    this.tokens = opts.capacity
    this.lastRefillMs = nowMs
  }

  /** Consume one token if available. Returns false when the bucket is empty. */
  take(nowMs: number = Date.now()): boolean {
    const elapsedSec = Math.max(0, nowMs - this.lastRefillMs) / 1000
    this.tokens = Math.min(this.opts.capacity, this.tokens + elapsedSec * this.opts.refillPerSec)
    this.lastRefillMs = nowMs
    if (this.tokens < 1) return false
    this.tokens -= 1
    return true
  }
}
