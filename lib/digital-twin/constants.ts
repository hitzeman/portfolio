/**
 * Limits shared by the chat client, the chat route, and the MCP server.
 * This file has no dependencies so the browser bundle can import it.
 */

/** How many of the most recent turns are forwarded to the model. */
export const MAX_TURNS = 12;
/** Hard cap on a single message after trimming. */
export const MAX_MESSAGE_CHARS = 2000;
/** Hard cap on the raw chat request payload before parsing. */
export const MAX_BODY_BYTES = 64 * 1024;
