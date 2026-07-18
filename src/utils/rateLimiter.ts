export type RateLimitOptions = {
  /** Maximum number of actions allowed in the window. */
  max: number;
  /** Window size in milliseconds. */
  windowMs: number;
  /** If true, the caller will wait until a token is available. Otherwise it will return false immediately. */
  wait?: boolean;
};

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();
const inFlight = new Map<string, Promise<void>>();

function getBucket(key: string, now: number): Bucket {
  const existing = buckets.get(key);
  if (existing) return existing;
  const b: Bucket = { tokens: 0, lastRefill: now };
  buckets.set(key, b);
  return b;
}

function refill(key: string, options: RateLimitOptions, now: number) {
  const b = getBucket(key, now);
  const elapsed = now - b.lastRefill;
  if (elapsed <= 0) return;

  const refillCount = (elapsed / options.windowMs) * options.max;
  b.tokens = Math.min(options.max, b.tokens + refillCount);
  b.lastRefill = now;
}

/**
 * Returns true if the action is permitted.
 * If wait=true, the promise resolves when permitted.
 */
export async function rateLimit(key: string, options: RateLimitOptions): Promise<boolean> {
  const wait = options.wait ?? false;
  const now = Date.now();

  // Serialize waiters per key so multiple queued calls don't over-consume.
  if (wait) {
    const prev = inFlight.get(key) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((r) => (release = r));
    inFlight.set(key, prev.then(() => current));

    await prev;
    try {
      // After waiting for previous caller(s), attempt to consume tokens.
      // Refill and consume atomically within this call.
      const n = Date.now();
      refill(key, options, n);
      const b = getBucket(key, n);
      if (b.tokens >= 1) {
        b.tokens -= 1;
        return true;
      }

      // Not enough tokens; calculate wait time until at least 1 token is available.
      const deficit = 1 - b.tokens;
      const msPerToken = options.windowMs / options.max;
      const delayMs = Math.ceil(deficit * msPerToken);
      await new Promise((r) => setTimeout(r, delayMs));

      const n2 = Date.now();
      refill(key, options, n2);
      const b2 = getBucket(key, n2);
      if (b2.tokens >= 1) {
        b2.tokens -= 1;
        return true;
      }
      return false;
    } finally {
      release();
      // Clean up: remove inFlight only if it still points to current promise chain.
      const check = inFlight.get(key);
      if (check === prev.then(() => current)) {
        inFlight.delete(key);
      }
    }
  }

  // Non-waiting: refuse immediately when insufficient tokens.
  refill(key, options, now);
  const b = getBucket(key, now);
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return true;
  }
  return false;
}

export function createRateLimiter(key: string, options: RateLimitOptions) {
  return {
    async allow(waitOverride?: boolean) {
      return rateLimit(key, { ...options, wait: waitOverride ?? options.wait });
    },
  };
}

