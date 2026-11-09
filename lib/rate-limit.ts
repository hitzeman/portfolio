/**
 * A small fixed-window rate limiter kept in process memory.
 *
 * Good enough for a single-instance portfolio site: it stops one visitor
 * (or one bot) from burning through the OpenAI budget. It is NOT shared
 * across serverless instances or restarts; see README "Limitations".
 */
export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfterSeconds: number;
};

export type RateLimiter = {
  check(key: string, now?: number): RateLimitDecision;
  /** Test seam. */
  reset(): void;
};

type Window = { count: number; resetAt: number };

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
  /** Prune stale entries once the map grows past this size. */
  maxKeys?: number;
}): RateLimiter {
  const { limit, windowMs, maxKeys = 10_000 } = options;
  const windows = new Map<string, Window>();

  function prune(now: number) {
    if (windows.size < maxKeys) return;
    for (const [k, w] of windows) {
      if (w.resetAt <= now) windows.delete(k);
    }
  }

  return {
    check(key, now = Date.now()) {
      prune(now);
      let w = windows.get(key);
      if (!w || w.resetAt <= now) {
        w = { count: 0, resetAt: now + windowMs };
        windows.set(key, w);
      }
      w.count += 1;
      const retryAfterSeconds = Math.max(1, Math.ceil((w.resetAt - now) / 1000));
      if (w.count > limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }
      return { allowed: true, remaining: limit - w.count, retryAfterSeconds };
    },
    reset() {
      windows.clear();
    },
  };
}

/** Best-effort client identity behind common proxies. */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
