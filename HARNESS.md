# The agent harness

This document walks through every file that exists to make an AI coding agent's output trustworthy before a human reads the diff. For each: what it is, why it is here, and the class of agent error it catches.

Honesty note on provenance: the harness was added on the `feat/agentic-harness` branch in November 2026, after the site itself (May 2026). The MCP server, the hardened chat route, and the later commits on that branch were produced under the gate described here; the original site was not. The [Lessons](#lessons) section is intentionally empty of invented incidents.

## How the pieces fit

```
                 ┌──────────── always in context ────────────┐
   agent reads   │ AGENTS.md  (any agent)                     │
                 │ CLAUDE.md  (= AGENTS.md + Claude specifics)│
                 └─────────────┬──────────────────────────────┘
                               │ points to, on demand
                 ┌─────────────▼──────────────────────────────┐
   agent uses    │ .claude/skills/add-mcp-tool                │
                 │ .claude/skills/verify-change               │
                 │ .mcp.json  (the repo's own MCP server)     │
                 └─────────────┬──────────────────────────────┘
                               │ must pass
                 ┌─────────────▼──────────────────────────────┐
   gate          │ scripts/verify.mjs: lint → typecheck → test│
                 │   ← .claude/settings.json Stop hook        │
                 │   ← .github/workflows/ci.yml (+audit+build)│
                 └─────────────┬──────────────────────────────┘
                               │ enforced by
                 ┌─────────────▼──────────────────────────────┐
   checks        │ eslint.config.mjs · tsconfig (strict)      │
                 │ vitest.config.mts · *.test.ts              │
                 └────────────────────────────────────────────┘
```

## File by file

### Instruction files

**`AGENTS.md`**
The canonical instruction file, readable by any agent. It is short on purpose: a map of the repo, the gate command, six conventions, and the three-part rule for adding an MCP tool. It caches only what an agent cannot discover by looking (the single-source-of-truth rule for facts, the "errors are data" convention, the reason the OpenAI client is lazy). Commands live in `package.json`, so the file names the gate and defers the rest.
*Catches:* the agent inventing facts outside `profile.ts`; the agent adding a tool without a test; the agent writing Next.js code from stale training data (the Next 16 warning is kept and strengthened).

**`CLAUDE.md`**
Includes `AGENTS.md` with `@AGENTS.md` so there is one body of instructions, then adds only what is Claude-specific: that a Stop hook exists and must not be worked around, and which skills to reach for.
*Catches:* divergence between what Claude and other agents are told.

### Skills

**`.claude/skills/add-mcp-tool/SKILL.md`**
A five-step procedure that forces the order schema → failing contract test → implementation → registry → README. Each step ends on something observable (the test fails for the right reason; `TOOL_NAMES`, the server, and the tests agree). The description is written so Claude reaches for it autonomously whenever a tool's contract is touched.
*Catches:* tools with no bounds on inputs; tools that throw instead of returning structured errors; tools that exist in code but not in the README; logic written straight into the handler where it cannot be unit-tested.

**`.claude/skills/verify-change/SKILL.md`**
Tells the agent exactly what "verified" means here: the gate, plus `npm run build` when `app/` changed, plus a real-stdio smoke when the server entry or dependencies changed. It ends with "report verbatim".
*Catches:* "tests pass" claims made from memory; changes that pass Vitest but fail the Next build (route-export rules, server/client boundaries); servers that work in-process but die on real stdio.

### Hooks and permissions

**`.claude/settings.json`**
Two things. A `Stop` hook runs `scripts/verify.mjs --hook --quick` whenever Claude tries to end its turn with a dirty working tree; a failure exits 2, which blocks the stop and feeds the failing output back to the agent. A permissions allow-list lets the gate commands run without prompting, so the hook and the skills do not stall waiting for a human.
*Catches:* the agent declaring victory with a red typecheck or failing tests. The `--quick` flag skips lint on the hook to keep the stop responsive; lint still runs in `npm run verify` and in CI.

**`scripts/verify.mjs`**
The gate itself, as a small Node script rather than a chain of `&&` so it behaves the same on Windows and Linux, prints which step failed, and can act as a hook: it reads the hook's JSON from stdin, skips when `git status` is clean, and if `stop_hook_active` is set (meaning this is already the re-run after a block) it reports but does not block again, so a stubborn failure cannot trap the session in a loop.
*Catches:* half-finished work; infinite hook loops.

### Quality checks

**`eslint.config.mjs`**
`eslint-config-next` core-web-vitals and typescript rule sets, flat config as Next 16 requires. Unused variables are errors (with the `_` escape hatch).
*Catches:* dead imports and variables that an agent leaves behind after refactors; React hook misuse; Next-specific anti-patterns.

**`tsconfig.json`** (`strict: true`, pre-existing) and `npm run typecheck`
Strict TypeScript across app, lib, MCP server, and tests.
*Catches:* the most common agent error class in TypeScript: plausible code against an imagined API. The MCP SDK and OpenAI SDK types are the contract.

**`vitest.config.mts`**
Node environment, `OPENAI_API_KEY` forced empty, mocks restored between tests.
*Catches:* a test that silently hits the real OpenAI API because a key leaked in from the shell.

**`lib/**/*.test.ts`, `app/api/chat/route.test.ts`**
Unit tests for the message schema and sanitizer, the prompt builder, the rate limiter, and upstream error classification. Contract tests for `/api/chat` with OpenAI mocked at the module boundary: valid input streams; invalid JSON, schema violations, oversized bodies, and rate-limit breaches each return a specific status and `error.code`; upstream exceptions become a generic in-stream message and never leak the raw text.
*Catches:* regressions in input bounds; error messages that start leaking upstream details again; the prompt drifting from `profile.ts` (the prompt test asserts every highlight, project, and boundary is present).

**`mcp/queries.test.ts`, `mcp/server.test.ts`**
Pure-logic tests for the query functions, and an in-process integration test that connects a real MCP `Client` over `InMemoryTransport`, lists tools, asserts every tool has a description, input schema, output schema, and read-only annotation, then calls each tool with valid input (shape checked) and invalid input (rejected with the JSON-RPC `-32602` code). `ask_digital_twin` is exercised with an injected fake model for success and for each upstream failure class.
*Catches:* a tool registered without a schema or description; a tool added to the server but not to `TOOL_NAMES` (or the reverse); handler logic that throws; error paths that were never run.

### CI

**`.github/workflows/ci.yml`**
On every push to `main` and every pull request: `npm ci`, lint, typecheck, test, `npm audit --audit-level=high`, a production `next build`, and a smoke test that boots the MCP server over real stdio and asserts `tools/list` returns tools.
*Catches:* everything above, on a machine the agent did not touch; new high-severity advisories; code that only built because of local state.

### Shared core

Not harness files in the strict sense, but they are what make the harness enforceable.

**`app/_data/profile.ts`** is the single source of truth for every fact. The site, the system prompt, and all six tools derive from it, and the prompt test fails if they drift.

**`lib/digital-twin/`** holds the system prompt, the zod request schema and sanitizer, the lazy OpenAI client, and `classifyUpstreamError`, which maps any thrown error to a stable `{ code, message }` so clients and agents see the same five error kinds. Having one implementation means one set of tests.

**`mcp/errors.ts`** defines `toolError` / `toolResult`, so every tool fails the same way and the integration test can assert on it generically.

### Agent-facing config

**`.mcp.json`** registers this repo's own server with Claude Code. An agent working on a tool can call the tool it just changed. It also makes the server's install story testable: if `.mcp.json` works, the README instructions work.

## What the harness does not do

- It does not prove the content is true. `profile.ts` is self-reported.
- It does not stop an agent from writing a bad test. Review still matters; the harness narrows what review has to look for.
- The Stop hook only fires inside Claude Code. Other agents rely on `AGENTS.md` telling them to run the gate, and on CI.
- Coverage is not measured. The tests target the logic and the contracts; a number was not the goal.

## Lessons

Real incidents only. Each entry should say what the agent did, which check caught it (or did not), and what changed in the harness as a result.

- TODO(Todd): first incident where the Stop hook blocked a finish, and whether the failing output was enough for the agent to self-correct.
- TODO(Todd): first time `add-mcp-tool` was used end to end; did the agent follow schema-first, or skip to implementation?
- TODO(Todd): first CI failure that local verify did not catch (candidates: the Next build step, the stdio smoke, audit).
- TODO(Todd): any case where an agent invented a fact that the prompt test or review caught, and what rule was added.
- TODO(Todd): anything the hook made worse (slow stops, false blocks) and how it was tuned.
