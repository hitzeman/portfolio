import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyUpstreamError,
  getOpenAIClient,
  isConfigured,
  resetOpenAIClient,
} from "./upstream";

afterEach(() => {
  resetOpenAIClient();
});

describe("isConfigured", () => {
  it("is false without a key and true with one", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(isConfigured()).toBe(false);
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    expect(isConfigured()).toBe(true);
  });
});

describe("getOpenAIClient", () => {
  it("does not throw at import time and caches the instance", () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const a = getOpenAIClient();
    const b = getOpenAIClient();
    expect(a).toBe(b);
  });
});

describe("classifyUpstreamError", () => {
  it("maps timeouts", () => {
    const e = Object.assign(new Error("aborted"), { name: "TimeoutError" });
    expect(classifyUpstreamError(e).code).toBe("upstream_timeout");
    const sdk = Object.assign(new Error("t"), { name: "APIConnectionTimeoutError" });
    expect(classifyUpstreamError(sdk).code).toBe("upstream_timeout");
  });

  it("maps 429 and extracts retry-after", () => {
    const e = Object.assign(new Error("rl"), {
      status: 429,
      headers: new Headers({ "retry-after": "7" }),
    });
    expect(classifyUpstreamError(e)).toMatchObject({
      code: "rate_limited",
      status: 429,
      retryAfterSeconds: 7,
    });
  });

  it("maps auth failures", () => {
    expect(classifyUpstreamError({ status: 401 }).code).toBe("upstream_auth");
    expect(classifyUpstreamError({ status: 403 }).code).toBe("upstream_auth");
  });

  it("never leaks the raw message", () => {
    const secretish = new Error("Incorrect API key provided: sk-live-abc123");
    const out = classifyUpstreamError(secretish);
    expect(out.code).toBe("upstream_error");
    expect(out.message).not.toContain("sk-live");
    expect(classifyUpstreamError(undefined).code).toBe("upstream_error");
  });
});
