# Todd Hitzeman — portfolio + MCP server

[![CI](https://github.com/hitzeman/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/hitzeman/portfolio/actions/workflows/ci.yml)

A personal portfolio site with an AI "Digital Twin" that answers questions about my career, and an MCP server that exposes the same profile data to any agent. Both read from one file, `app/_data/profile.ts`, so the website, the chat, and the tools can never disagree.

This repo is also a worked example of an **agent harness**: the instruction files, skills, hooks, tests, and CI that an AI coding agent has to satisfy before a human reviews its diff. [`HARNESS.md`](HARNESS.md) walks through every piece.

## Contents

- [MCP server](#mcp-server)
  - [Tools](#tools)
  - [Use it from Claude Code](#use-it-from-claude-code)
  - [Use it from Claude Desktop](#use-it-from-claude-desktop)
- [Website](#website)
- [Environment variables](#environment-variables)
- [Development](#development)
- [Limitations](#limitations)
- [License](#license)

## MCP server

A stdio server built on `@modelcontextprotocol/sdk`. Every tool has a zod input schema with model-facing descriptions, an output schema (so results arrive as `structuredContent`), read-only annotations, and structured error results. Schema violations are rejected by the SDK before a handler runs.

```
npm install
npm run mcp          # starts on stdio; logs go to stderr
```

### Tools

| Tool | What it returns | Inputs |
|---|---|---|
| `get_profile` | Name, title, location, availability, bio, headline stats, contact, education, certifications | none |
| `list_skills` | Skills grouped by category | `category?` enum: `Frontend`, `Backend`, `Cloud`, `AIEngineering`, `Practice` |
| `get_timeline` | Career history, most recent first, with highlight bullets | `company?` string 1–100 |
| `list_projects` | Selected projects with technologies, contributions, and an explicit `status` for prototypes or in-progress work | `context?` string 1–100, `technology?` string 1–60 |
| `search_experience` | Verbatim snippets from highlights, projects, skills, and AI practices, ranked by query terms matched | `query` string 2–200, `limit?` int 1–20 (default 5) |
| `ask_digital_twin` | A first-person answer synthesized by the model from the profile only | `question` string 1–2000, `history?` up to 10 prior turns |

Example calls (JSON-RPC `tools/call` params):

```json
{ "name": "get_profile", "arguments": {} }
```

```json
{ "name": "list_skills", "arguments": { "category": "AIEngineering" } }
```

```json
{ "name": "get_timeline", "arguments": { "company": "loanDepot" } }
```

```json
{ "name": "list_projects", "arguments": { "technology": "Puppeteer" } }
```

```json
{ "name": "search_experience", "arguments": { "query": "Angular SSR migration", "limit": 3 } }
```

```json
{
  "name": "ask_digital_twin",
  "arguments": {
    "question": "Would you be a fit for a staff frontend role?",
    "history": [{ "role": "user", "content": "Hi" }, { "role": "assistant", "content": "Hello!" }]
  }
}
```

Errors come back as `isError: true` results with a body like:

```json
{ "error": { "code": "not_found", "message": "No timeline entries for company \"Initech\".", "hint": "Use one of the known companies, or omit `company` for the full history.", "details": { "knownCompanies": ["loanDepot", "CMHWorks"] } } }
```

Codes: `not_found`, `not_configured`, `upstream_timeout`, `rate_limited`, `upstream_auth`, `upstream_error`.

### Use it from Claude Code

The repo ships a [`.mcp.json`](.mcp.json), so opening the project in Claude Code registers the server as `portfolio` automatically (after `npm install`). To add it from anywhere:

```
claude mcp add portfolio -- npx tsx /absolute/path/to/portfolio/mcp/stdio.ts
```

### Use it from Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "npx",
      "args": ["-y", "tsx@4", "/absolute/path/to/portfolio/mcp/stdio.ts"],
      "env": { "OPENAI_API_KEY": "optional, only for ask_digital_twin" }
    }
  }
}
```

On Windows, wrap the command: `"command": "cmd", "args": ["/c", "npx", "-y", "tsx@4", "C:/path/to/portfolio/mcp/stdio.ts"]`. Imports resolve from the project's `node_modules`, so run `npm install` in the repo first.

## Website

```
npm install
cp .env.example .env.local   # then add your key
npm run dev                  # http://localhost:3000
```

The Digital Twin panel posts to `POST /api/chat`, which validates the body with zod (bounded to 50 messages of 4000 chars, 64 KB total), keeps the last 12 turns, rate-limits each visitor to 20 messages a minute, applies a 30-second upstream timeout, and streams plain text back. Failures are structured JSON with `error.code` (`invalid_json`, `invalid_request`, `payload_too_large`, `rate_limited`, `not_configured`) or, mid-stream, a generic `[error] …` line. Raw upstream errors are logged server-side and never sent to the browser.

The UI labels the chat as an AI, shows the model name, and the prompt tells the model to confirm it is an AI when asked directly. Per OpenAI's usage policies, people must not be misled into thinking they are talking to a human.

## Environment variables

| Variable | Used by | Required? |
|---|---|---|
| `OPENAI_API_KEY` | `/api/chat`, MCP `ask_digital_twin` | Required for the website chat (route returns 503 without it). Optional for the MCP server; only `ask_digital_twin` needs it and returns `not_configured` otherwise. |

Keys are read from the environment only. `.env*` files are gitignored. Vitest clears the key so tests cannot reach the network.

## Development

| Command | Purpose |
|---|---|
| `npm run verify` | **The gate.** lint → typecheck → tests. Green verify is the definition of done. |
| `npm test` / `npm run test:watch` | Vitest: unit tests for the logic, contract tests per route and tool, and an in-process MCP client integration test. No network. |
| `npm run lint` | ESLint (`eslint-config-next` core-web-vitals + typescript). |
| `npm run typecheck` | `tsc --noEmit`, strict. |
| `npm run build` | Production Next.js build. |
| `npm run mcp` | Start the MCP server on stdio. |

CI (`.github/workflows/ci.yml`) runs all of the above plus `npm audit --audit-level=high` and a stdio boot check on every push to `main` and every pull request.

Agent instructions live in [`AGENTS.md`](AGENTS.md) (any agent) and [`CLAUDE.md`](CLAUDE.md) (Claude Code: Stop hook, skills). The reasoning behind each file is in [`HARNESS.md`](HARNESS.md).

## Limitations

- **Rate limiting is per process.** The chat limiter is an in-memory map; it resets on deploy and is not shared across serverless instances. Good enough to stop one visitor from draining the OpenAI budget, not a real abuse control.
- **No authentication.** `/api/chat` is public by design. The MCP server speaks stdio only and has no auth; do not expose it over a network transport without adding some.
- **`ask_digital_twin` has no local rate limit.** It is a local, single-user tool; the upstream's limits apply and surface as `rate_limited`.
- **Search is keyword matching,** not semantic. It is deliberately explainable (one point per matched term, plus one for the whole phrase) and returns verbatim text so answers can be quoted.
- **Facts are self-reported.** Everything comes from `app/_data/profile.ts`. Numbers in the AI-engineering evidence are described with their caveats there; the model is instructed not to invent others, but a language model can still misstate things, and the UI says so.
- **`npm audit` still reports moderate advisories** in the ESLint toolchain (transitive `minimatch`). They are dev-only and have no fix that does not downgrade ESLint; CI gates at high severity.
- **Node 20.11+ is required** (Node 24 in CI).

## License

Code is released under the [MIT License](LICENSE).

The written content about me (`app/_data/profile.ts`, bio text, project descriptions, and the tutorial under `docs/`) is © Todd Hitzeman and is not covered by the MIT grant. Fork the code; replace the profile with your own.
