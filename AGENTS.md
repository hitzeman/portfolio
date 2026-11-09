# Agent guide

Personal portfolio site (Next.js 16, App Router) with an AI "Digital Twin"
chat, plus an MCP server that exposes the same profile data to agents.
Both surfaces answer from one file: `app/_data/profile.ts`.

## Map

| Path | What lives there |
|---|---|
| `app/_data/profile.ts` | **Single source of truth** for every fact about Todd. Prompt, site, and MCP tools all derive from it. |
| `app/_components/` | Site sections. Server components unless they need state. |
| `app/api/chat/route.ts` | Streaming chat endpoint. Only HTTP-method and config exports are allowed in a route file. |
| `lib/digital-twin/` | Shared core: system prompt, request schema and sanitizer, upstream client, error classification, limits. |
| `lib/rate-limit.ts` | In-memory fixed-window limiter. |
| `mcp/` | MCP server. `queries.ts` holds logic, `tools/*.ts` are thin adapters, `tools/index.ts` is the registry, `stdio.ts` is the entry point. |
| `scripts/verify.mjs` | The quality gate. Also the Claude Code Stop hook. |
| `HARNESS.md` | Why each harness file exists and what agent error it catches. |

## Commands

Scripts are defined in `package.json`. The ones that matter:

- `npm run verify` is the gate: lint, then typecheck, then tests. **Green verify is the definition of done.** Never report a change as finished with a red gate.
- `npm run build` additionally when you touch anything under `app/`.
- `npm run mcp` starts the MCP server on stdio for manual checks.
- `next lint` no longer exists in Next 16; use `npm run lint`.

## Conventions

- **Facts live in `profile.ts`.** Never add a claim, metric, date, or employer anywhere else. The prompt test fails if the prompt and profile drift.
- **No network in tests.** Mock OpenAI at the module boundary (`vi.mock("openai")`) or inject `askModel`. Vitest scrubs `OPENAI_API_KEY`.
- **Errors are data.** Route handlers return `{ error: { code, message, details? } }` with a real status. MCP tools return `toolError({ code, message, hint, details })`. Raw upstream error text never reaches a client; log it and return a classified message.
- **Bounded inputs.** Every external input has a zod schema with explicit min/max/enum. Limits shared with the browser go in `lib/digital-twin/constants.ts`.
- **The OpenAI client is lazy.** Importing any module must not throw when the key is absent (`next build`, tests).
- **Secrets** come from the environment only. `.env*` is gitignored. Never print a key, even redacted, in a commit, test, or log.

## Adding an MCP tool

A new tool is three things or it does not exist: **schema, contract test, README entry.**

1. Write the contract test first in `mcp/server.test.ts` (valid call returns the expected shape; invalid call is rejected; domain failures return a structured error).
2. Create `mcp/tools/<name>.ts` exporting `name` and `register(server)`. Every parameter gets `.describe()`. Put non-trivial logic in `mcp/queries.ts` with its own unit test.
3. Add it to `TOOL_NAMES` and `registerAllTools` in `mcp/tools/index.ts`. The integration test fails until the registry, the server, and the tests agree.
4. Add a row and an example call to the **Tools** table in `README.md`.

## Pull requests

Separate, reviewable commits. A commit message says what changed and why, and names any behaviour that was removed.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
