import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools, type ToolDeps } from "./tools/index";

export const SERVER_NAME = "portfolio";
export const SERVER_VERSION = "0.1.0";

/**
 * Builds the MCP server with every tool registered. Transport-agnostic so
 * tests can attach an in-memory transport and production can attach stdio
 * (see stdio.ts).
 */
export function createServer(deps: ToolDeps = {}): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "Tools for answering questions about Todd Hitzeman's professional background. " +
        "Start with get_profile for an overview, use list_skills / get_timeline / list_projects for structured facts, " +
        "search_experience to find verbatim evidence for a claim, and ask_digital_twin for a synthesized first-person answer. " +
        "All data comes from Todd's published profile; nothing here is private.",
    }
  );
  registerAllTools(server, deps);
  return server;
}
