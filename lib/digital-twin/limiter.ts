import { createRateLimiter } from "../rate-limit";

/**
 * The chat route's per-visitor budget: 20 messages per minute.
 * Lives outside route.ts because Next.js only allows HTTP-method and
 * config exports from a route module.
 */
export const chatLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });
