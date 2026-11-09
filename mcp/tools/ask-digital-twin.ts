import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MAX_MESSAGE_CHARS } from "../../lib/digital-twin/constants";
import { buildSystemPrompt } from "../../lib/digital-twin/prompt";
import {
  MAX_COMPLETION_TOKENS,
  MODEL,
  UPSTREAM_TIMEOUT_MS,
  classifyUpstreamError,
  getOpenAIClient,
  isConfigured,
} from "../../lib/digital-twin/upstream";
import { toolError, toolResult } from "../errors";

export const name = "ask_digital_twin";

export type TwinMessage = { role: "user" | "assistant"; content: string };

/**
 * Boundary for the only network call in the server. The default talks to
 * OpenAI; tests inject a fake. Must resolve to the answer text or throw.
 */
export type AskModel = (messages: TwinMessage[]) => Promise<string>;

export const defaultAskModel: AskModel = async (messages) => {
  const completion = await getOpenAIClient().chat.completions.create(
    {
      model: MODEL,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
    },
    { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) }
  );
  return completion.choices[0]?.message?.content?.trim() ?? "";
};

const inputSchema = {
  question: z
    .string()
    .trim()
    .min(1)
    .max(MAX_MESSAGE_CHARS)
    .describe("The visitor's question, in natural language."),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
      })
    )
    .max(10)
    .default([])
    .describe("Optional prior turns of this conversation, oldest first, to keep follow-ups coherent."),
};

const outputSchema = {
  answer: z.string().describe("Plain-text answer in Todd's first-person voice."),
  model: z.string().describe("Model that produced the answer."),
};

export function register(server: McpServer, askModel: AskModel = defaultAskModel) {
  server.registerTool(
    name,
    {
      title: "Ask the digital twin",
      description:
        "Asks Todd's AI digital twin a free-form question and returns a first-person answer grounded only in the published profile. Use this for synthesis ('would Todd fit a staff frontend role?'); use the other tools for raw facts. Requires OPENAI_API_KEY on the server; otherwise returns a not_configured error. May take several seconds.",
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
    },
    async ({ question, history }) => {
      if (!isConfigured()) {
        return toolError({
          code: "not_configured",
          message: "OPENAI_API_KEY is not set, so the digital twin cannot answer.",
          hint: "Set OPENAI_API_KEY in the server's environment, or use get_profile / search_experience for facts without the model.",
        });
      }

      try {
        const answer = await askModel([...history, { role: "user", content: question }]);
        if (!answer) {
          return toolError({
            code: "upstream_error",
            message: "The model returned an empty answer.",
            hint: "Retry once; if it persists, rephrase the question.",
          });
        }
        return toolResult({ answer, model: MODEL });
      } catch (err) {
        const classified = classifyUpstreamError(err);
        console.error("[mcp] ask_digital_twin upstream failure", {
          code: classified.code,
          status: classified.status,
          error: err instanceof Error ? err.message : String(err),
        });
        return toolError({
          code: classified.code,
          message: classified.message,
          hint:
            classified.code === "rate_limited"
              ? `Wait ${classified.retryAfterSeconds ?? "a few"} seconds and retry.`
              : classified.code === "upstream_timeout"
                ? "Retry, or ask a narrower question."
                : "Retry later; if it persists, the server operator should check logs.",
          ...(classified.retryAfterSeconds
            ? { details: { retryAfterSeconds: classified.retryAfterSeconds } }
            : {}),
        });
      }
    }
  );
}
