@AGENTS.md

## Claude Code specifics

- A **Stop hook** (`.claude/settings.json`) runs `scripts/verify.mjs --hook` whenever you try to finish with a dirty working tree. A red gate sends you back with the failing output. Fix it; do not work around the hook.
- Use the **`verify-change`** skill before declaring any change done, and the **`add-mcp-tool`** skill whenever a tool is added or its contract changes.
- The repo's own MCP server is registered in `.mcp.json` as `portfolio`; you can call its tools to check behaviour end to end.
