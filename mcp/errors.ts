import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Every tool failure is returned as a structured, machine-readable result
 * rather than a thrown exception, so a calling agent can branch on `code`
 * and read `hint` for what to do next. Schema violations never reach this
 * layer: the SDK rejects them before the handler runs (JSON-RPC -32602).
 */
export type ToolErrorCode =
  | "not_found"
  | "not_configured"
  | "upstream_timeout"
  | "rate_limited"
  | "upstream_auth"
  | "upstream_error";

export type ToolError = {
  code: ToolErrorCode;
  message: string;
  /** What the caller can do about it. */
  hint?: string;
  /** Extra machine-readable context (e.g. the list of valid values). */
  details?: Record<string, unknown>;
};

export function toolError(error: ToolError): CallToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: JSON.stringify({ error }, null, 2) }],
  };
}

/** Success result carrying both a text rendering and typed structured content. */
export function toolResult<T extends Record<string, unknown>>(data: T): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
