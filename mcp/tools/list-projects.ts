import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolResult } from "../errors";
import { knownTechnologies, listProjects } from "../queries";

export const name = "list_projects";

const inputSchema = {
  context: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe("Case-insensitive substring of the employer/context, e.g. \"loanDepot\" or \"CMHWorks\"."),
  technology: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .optional()
    .describe("Case-insensitive substring of a technology name, e.g. \"Angular\" or \"Lambda\"."),
};

const outputSchema = {
  total: z.number().int().describe("Number of projects returned."),
  projects: z.array(
    z.object({
      name: z.string(),
      context: z.string(),
      technologies: z.array(z.string()),
      summary: z.string(),
      contributions: z.array(z.string()),
      status: z
        .string()
        .optional()
        .describe("Present when the work is a prototype or in progress. Treat absence as 'merged/shipped' only if the summary says so."),
    })
  ),
  availableTechnologies: z
    .array(z.string())
    .optional()
    .describe("Returned when nothing matched, to help refine the filter."),
};

export function register(server: McpServer) {
  server.registerTool(
    name,
    {
      title: "List projects",
      description:
        "Lists Todd's selected projects with context, technologies, summary, contributions, and an explicit status for anything that is a prototype or still in progress. Filter by `context` and/or `technology`. An empty result is not an error; it includes the list of known technologies to refine by.",
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ context, technology }) => {
      const projects = listProjects({ context, technology });
      return toolResult({
        total: projects.length,
        projects,
        ...(projects.length === 0 ? { availableTechnologies: knownTechnologies() } : {}),
      });
    }
  );
}
