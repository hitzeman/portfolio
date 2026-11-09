---
name: verify-change
description: Run the full quality gate (lint, typecheck, unit + contract + MCP integration tests, and build/stdio checks when relevant) and report results verbatim. Use before declaring any change done, before committing, and whenever asked to verify, check, or prove a change works.
---

# Verify a change

The gate decides whether work is done; your impression does not. Run it, read the output, report it as it is.

## 1. The gate

```
npm run verify
```

Runs lint → typecheck → `vitest run` (unit, contract, and the in-process MCP integration test). It stops at the first failure.

## 2. Conditional extras

Run these when the change touches the named area. They are not optional for that area.

| Changed | Also run |
|---|---|
| anything under `app/` | `npm run build` (catches route-export and server/client boundary errors tests cannot) |
| `mcp/stdio.ts`, `mcp/server.ts`, dependencies | the stdio smoke below (catches "works in-process, dies on real stdio") |
| `package.json` dependencies | `npm audit --audit-level=high` |

Stdio smoke:

```
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' '{"jsonrpc":"2.0","method":"notifications/initialized"}' '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | npx tsx mcp/stdio.ts 2>/dev/null
```

Expect a `tools/list` response naming every tool in `mcp/tools/index.ts`.

## 3. Report

State each command and its outcome. On failure, quote the failing assertion or error block, fix the cause, and re-run from step 1. A change is done only when every command you ran passed on the final run.
