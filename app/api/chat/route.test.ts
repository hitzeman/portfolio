import { beforeEach, describe, expect, it, vi } from "vitest";
import { chatLimiter } from "../../../lib/digital-twin/limiter";
import { resetOpenAIClient } from "../../../lib/digital-twin/upstream";

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock("openai", () => ({
  default: class OpenAI {
    chat = { completions: { create: createMock } };
  },
}));

import { POST } from "./route";

async function* chunks(parts: string[]) {
  for (const p of parts) {
    yield { choices: [{ delta: { content: p } }] };
  }
}

function post(body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: raw,
    })
  );
}

const ask = (content: string) => ({ messages: [{ role: "user", content }] });

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  resetOpenAIClient();
  chatLimiter.reset();
  createMock.mockReset();
});

describe("POST /api/chat contract", () => {
  it("streams the model's text for a valid request", async () => {
    createMock.mockResolvedValue(chunks(["Hel", "lo", "!"]));
    const res = await post(ask("hi"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
    expect(await res.text()).toBe("Hello!");

    const [params, options] = createMock.mock.calls[0];
    expect(params.stream).toBe(true);
    expect(params.messages[0].role).toBe("system");
    expect(params.messages.at(-1)).toEqual({ role: "user", content: "hi" });
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns a structured 503 when the server has no key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const res = await post(ask("hi"));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: { code: "not_configured", message: expect.any(String) },
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns a structured 400 for invalid JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_json");
  });

  it("returns a structured 400 with details for a schema violation", async () => {
    const res = await post({ messages: [{ role: "system", content: "x" }] });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_request");
    expect(body.error.details[0]).toMatch(/^messages\.0\.role/);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the last message is not from the user", async () => {
    const res = await post({
      messages: [
        { role: "user", content: "q" },
        { role: "assistant", content: "a" },
      ],
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toMatch(/last message/i);
  });

  it("rejects oversized bodies with 413", async () => {
    const res = await post(ask("x"), { "content-length": String(10 * 1024 * 1024) });
    expect(res.status).toBe(413);
  });

  it("rate-limits a single client with 429 and Retry-After", async () => {
    createMock.mockImplementation(() => chunks(["ok"]));
    const headers = { "x-forwarded-for": "203.0.113.5" };
    for (let i = 0; i < 20; i++) {
      expect((await post(ask("hi"), headers)).status).toBe(200);
    }
    const blocked = await post(ask("hi"), headers);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await blocked.json()).error.code).toBe("rate_limited");

    // A different client is unaffected.
    const other = await post(ask("hi"), { "x-forwarded-for": "203.0.113.6" });
    expect(other.status).toBe(200);
  });
});

describe("POST /api/chat upstream failure handling", () => {
  it("turns an upstream exception into a generic in-stream error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    createMock.mockRejectedValue(
      Object.assign(new Error("Incorrect API key provided: sk-live-123"), { status: 401 })
    );
    const res = await post(ask("hi"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("[error]");
    expect(text).not.toContain("sk-live");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("reports a timeout as a timeout", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createMock.mockRejectedValue(Object.assign(new Error("t"), { name: "TimeoutError" }));
    const text = await (await post(ask("hi"))).text();
    expect(text).toMatch(/did not respond within/i);
  });

  it("reports upstream rate limiting without exposing internals", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createMock.mockRejectedValue(Object.assign(new Error("429 details"), { status: 429 }));
    const text = await (await post(ask("hi"))).text();
    expect(text).toMatch(/rate-limited/i);
    expect(text).not.toContain("429 details");
  });
});
