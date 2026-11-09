import OpenAI from "openai";

/** The model behind the Digital Twin. */
export const MODEL = "gpt-5.4-mini";
/** Maximum tokens the model may generate per answer. */
export const MAX_COMPLETION_TOKENS = 800;
/** Wall-clock budget for one upstream call, including streaming. */
export const UPSTREAM_TIMEOUT_MS = 30_000;

let client: OpenAI | null = null;

export function isConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Lazily constructs the OpenAI client so that importing a module which uses
 * it (the chat route, the MCP server) never throws at load time when the key
 * is absent, for example during `next build` or in tests.
 */
export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 1,
    });
  }
  return client;
}

/** Test seam: drop the cached client so a new env or mock takes effect. */
export function resetOpenAIClient(): void {
  client = null;
}

export type UpstreamErrorCode =
  | "not_configured"
  | "upstream_timeout"
  | "rate_limited"
  | "upstream_auth"
  | "upstream_error";

export type UpstreamError = {
  code: UpstreamErrorCode;
  /** Safe to show to an end user or return to an agent. */
  message: string;
  /** Seconds to wait before retrying, when the upstream told us. */
  retryAfterSeconds?: number;
  /** HTTP status from the upstream, when there was one. */
  status?: number;
};

type ErrorLike = {
  name?: string;
  status?: number;
  headers?: Headers | Record<string, string | undefined>;
};

function readHeader(
  headers: ErrorLike["headers"],
  name: string
): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get(name) ?? undefined;
  return headers[name] ?? headers[name.toLowerCase()];
}

/**
 * Maps whatever the OpenAI SDK (or a timeout) threw into a small, stable
 * error shape. The raw error is for logs; the returned message is the only
 * thing that reaches a browser or an agent.
 */
export function classifyUpstreamError(err: unknown): UpstreamError {
  const e = (err ?? {}) as ErrorLike;

  if (e.name === "AbortError" || e.name === "TimeoutError" || e.name === "APIConnectionTimeoutError") {
    return {
      code: "upstream_timeout",
      message: `The model did not respond within ${UPSTREAM_TIMEOUT_MS / 1000} seconds. Please try again.`,
    };
  }

  if (e.status === 429) {
    const retryAfter = Number(readHeader(e.headers, "retry-after"));
    return {
      code: "rate_limited",
      status: 429,
      message: "The model is rate-limited right now. Please try again shortly.",
      ...(Number.isFinite(retryAfter) && retryAfter > 0
        ? { retryAfterSeconds: retryAfter }
        : {}),
    };
  }

  if (e.status === 401 || e.status === 403) {
    return {
      code: "upstream_auth",
      status: e.status,
      message: "The model service rejected this server's credentials.",
    };
  }

  return {
    code: "upstream_error",
    ...(typeof e.status === "number" ? { status: e.status } : {}),
    message: "The model is unavailable right now. Please try again in a moment.",
  };
}
