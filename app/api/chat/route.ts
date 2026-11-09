import { buildSystemPrompt } from "../../../lib/digital-twin/prompt";
import {
  MAX_BODY_BYTES,
  chatRequestSchema,
  formatIssues,
  sanitizeMessages,
} from "../../../lib/digital-twin/messages";
import {
  MAX_COMPLETION_TOKENS,
  MODEL,
  UPSTREAM_TIMEOUT_MS,
  classifyUpstreamError,
  getOpenAIClient,
  isConfigured,
} from "../../../lib/digital-twin/upstream";
import { chatLimiter } from "../../../lib/digital-twin/limiter";
import { clientKeyFromHeaders } from "../../../lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorBody = {
  error: { code: string; message: string; details?: string[] };
};

function errorResponse(
  status: number,
  code: string,
  message: string,
  extra?: { details?: string[]; headers?: Record<string, string> }
) {
  const body: ErrorBody = { error: { code, message } };
  if (extra?.details) body.error.details = extra.details;
  return Response.json(body, { status, headers: extra?.headers });
}

export async function POST(req: Request) {
  if (!isConfigured()) {
    return errorResponse(
      503,
      "not_configured",
      "The digital twin is not configured on this server."
    );
  }

  const key = clientKeyFromHeaders(req.headers);
  const decision = chatLimiter.check(key);
  if (!decision.allowed) {
    return errorResponse(
      429,
      "rate_limited",
      "Too many messages. Please wait a moment and try again.",
      { headers: { "Retry-After": String(decision.retryAfterSeconds) } }
    );
  }

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return errorResponse(413, "payload_too_large", "Request body is too large.");
  }

  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return errorResponse(413, "payload_too_large", "Request body is too large.");
    }
    raw = JSON.parse(text);
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = chatRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse(400, "invalid_request", "Request did not match the schema.", {
      details: formatIssues(parsed.error),
    });
  }

  const sanitized = sanitizeMessages(parsed.data.messages);
  if (!sanitized.ok) {
    return errorResponse(
      400,
      "invalid_request",
      sanitized.reason === "empty"
        ? "At least one non-empty message is required."
        : "The last message must come from the user."
    );
  }

  const encoder = new TextEncoder();
  const abort = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await getOpenAIClient().chat.completions.create(
          {
            model: MODEL,
            stream: true,
            max_completion_tokens: MAX_COMPLETION_TOKENS,
            messages: [
              { role: "system", content: buildSystemPrompt() },
              ...sanitized.messages,
            ],
          },
          { signal: abort }
        );

        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        const classified = classifyUpstreamError(err);
        console.error("[/api/chat] upstream failure", {
          code: classified.code,
          status: classified.status,
          error: err instanceof Error ? err.message : String(err),
        });
        controller.enqueue(encoder.encode(`\n\n[error] ${classified.message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-RateLimit-Remaining": String(decision.remaining),
    },
  });
}
