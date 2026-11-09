import { describe, expect, it } from "vitest";
import { clientKeyFromHeaders, createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit and then blocks within the window", () => {
    const rl = createRateLimiter({ limit: 3, windowMs: 1000 });
    const t = 1_000_000;
    expect(rl.check("a", t).allowed).toBe(true);
    expect(rl.check("a", t + 1).allowed).toBe(true);
    expect(rl.check("a", t + 2)).toMatchObject({ allowed: true, remaining: 0 });
    expect(rl.check("a", t + 3)).toMatchObject({ allowed: false, remaining: 0 });
  });

  it("reports how long until the window resets", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 10_000 });
    const t = 5_000;
    rl.check("a", t);
    const blocked = rl.check("a", t + 2_500);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(8);
  });

  it("resets after the window", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    rl.check("a", 0);
    expect(rl.check("a", 1).allowed).toBe(false);
    expect(rl.check("a", 1000).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(rl.check("a", 0).allowed).toBe(true);
    expect(rl.check("b", 0).allowed).toBe(true);
    expect(rl.check("a", 1).allowed).toBe(false);
  });

  it("prunes expired keys once the map is large", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 100, maxKeys: 3 });
    rl.check("a", 0);
    rl.check("b", 0);
    rl.check("c", 0);
    // Past the window: the prune on this call clears a, b, c, so "a" is fresh.
    expect(rl.check("d", 500).allowed).toBe(true);
    expect(rl.check("a", 501).allowed).toBe(true);
  });
});

describe("clientKeyFromHeaders", () => {
  it("prefers the first x-forwarded-for hop", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(clientKeyFromHeaders(h)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip, then unknown", () => {
    expect(clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe(
      "198.51.100.2"
    );
    expect(clientKeyFromHeaders(new Headers())).toBe("unknown");
  });
});
