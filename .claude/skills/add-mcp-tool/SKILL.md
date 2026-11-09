---
name: add-mcp-tool
description: Scaffold or change an MCP tool in mcp/tools the required way (schema first, red contract test, implementation, registry, README). Use when adding a tool, renaming one, or changing a tool's inputs, outputs, or error cases.
---

# Add an MCP tool

A tool exists only when its **schema**, its **contract test**, and its **README row** all exist and agree. Work in this order; each step ends on a check you can see.

## 1. Fix the contract before any code

Decide and write down, in the test you are about to create:

- `name` in snake_case, a verb phrase (`search_experience`, not `experience`).
- Every input: type, bounds (`min`/`max`/`enum`), default, and one sentence a model will read to decide how to fill it.
- The success shape (becomes `outputSchema`).
- Each failure the handler itself can produce, as a `ToolError` code from `mcp/errors.ts`, with a `hint` saying what the caller should do next. Schema violations are not yours to handle: the SDK rejects them before the handler runs.

Done when: you can state every input bound and every error code without opening another file.

## 2. Red: write the contract test first

Add cases to `mcp/server.test.ts` inside the integration `describe`, using the existing helpers:

- valid call → `isError` falsy, `structuredContent` matches the shape, `parseText(r)` equals `structuredContent`;
- one invalid call per bound (too long, out of range, wrong type, bad enum) → `expectInvalidArgs(...)`;
- each domain failure → `isError: true`, body `error.code` is the code you chose, `error.hint` present.

If logic is more than a filter or a lookup, also add unit tests for it in `mcp/queries.test.ts`.

Run `npx vitest run mcp` and confirm the new cases fail for the right reason (tool not found / shape mismatch), not a syntax error.

## 3. Green: implement

Create `mcp/tools/<kebab-name>.ts` on the pattern of `mcp/tools/get-timeline.ts`:

- `export const name`, `export function register(server)`.
- `inputSchema` is a zod raw shape; `.describe()` on **every** field; `.trim()` on strings.
- `outputSchema` present; return `toolResult({...})` so `structuredContent` is validated.
- `annotations`: `readOnlyHint: true` unless the tool mutates; `openWorldHint: true` only if it leaves the process.
- Logic goes in `mcp/queries.ts`; the tool file stays an adapter.
- Anything that calls out of process gets a timeout (`AbortSignal.timeout`) and goes through `classifyUpstreamError`.

Register it in `mcp/tools/index.ts`: add to `TOOL_NAMES` **and** `registerAllTools`. Run `npx vitest run mcp` until green.

## 4. Document

In `README.md`, add a row to the **Tools** table and an example call block in the same style as the neighbours. Keep the description identical in spirit to the tool's `description` field.

## 5. Gate

Run the `verify-change` skill. Done when it is green and `git status` shows the test, the tool, the registry, and the README all changed together.
