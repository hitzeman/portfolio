import { z } from "zod";
import { MAX_MESSAGE_CHARS, MAX_TURNS } from "./constants";

export { MAX_BODY_BYTES, MAX_MESSAGE_CHARS, MAX_TURNS } from "./constants";

/** Upper bounds on what a client may *send*; anything beyond is rejected. */
export const MAX_INCOMING_MESSAGES = 50;
export const MAX_INCOMING_CHARS = 4000;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(MAX_INCOMING_CHARS),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(MAX_INCOMING_MESSAGES),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type SanitizeResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; reason: "empty" | "last_not_user" };

/**
 * Normalises a validated message list for the model:
 * trims whitespace, drops empty messages, truncates long ones,
 * keeps only the most recent MAX_TURNS, and requires the final
 * message to come from the user.
 */
export function sanitizeMessages(incoming: ChatMessage[]): SanitizeResult {
  const cleaned = incoming
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));

  if (cleaned.length === 0) return { ok: false, reason: "empty" };
  if (cleaned[cleaned.length - 1].role !== "user") {
    return { ok: false, reason: "last_not_user" };
  }
  return { ok: true, messages: cleaned };
}

/** Flattens a zod error into a short, client-safe list of field problems. */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".") || "body"}: ${i.message}`);
}
