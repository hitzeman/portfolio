import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as askDigitalTwin from "./ask-digital-twin";
import * as getProfile from "./get-profile";
import * as getTimeline from "./get-timeline";
import * as listProjects from "./list-projects";
import * as listSkills from "./list-skills";
import * as searchExperience from "./search-experience";

export type ToolDeps = {
  askModel?: askDigitalTwin.AskModel;
};

/**
 * Single registry of every tool the server exposes. The integration test
 * asserts that `listTools()` returns exactly TOOL_NAMES, so adding a tool
 * here without a contract test fails the gate.
 */
export const TOOL_NAMES = [
  getProfile.name,
  listSkills.name,
  getTimeline.name,
  listProjects.name,
  searchExperience.name,
  askDigitalTwin.name,
] as const;

export function registerAllTools(server: McpServer, deps: ToolDeps = {}) {
  getProfile.register(server);
  listSkills.register(server);
  getTimeline.register(server);
  listProjects.register(server);
  searchExperience.register(server);
  askDigitalTwin.register(server, deps.askModel);
}
