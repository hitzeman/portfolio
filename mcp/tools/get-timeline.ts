import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolError, toolResult } from "../errors";
import { getTimeline, knownCompanies } from "../queries";

export const name = "get_timeline";

const inputSchema = {
  company: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe(
      "Exact company name (case-insensitive) to filter by, e.g. \"loanDepot\". Omit for the full career history, most recent first."
    ),
};

const outputSchema = {
  entries: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string().describe("Human-readable date range."),
      location: z.string(),
      badge: z.string().optional().describe("e.g. \"Current\" or \"Concurrent contract\"."),
      highlights: z.array(z.string()),
    })
  ),
};

export function register(server: McpServer) {
  server.registerTool(
    name,
    {
      title: "Get career timeline",
      description:
        "Returns Todd's work history as ordered entries (most recent first) with role, company, period, location, and highlight bullets. Optionally filter to one company. Returns a not_found error listing valid companies if the filter matches nothing.",
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ company }) => {
      const entries = getTimeline(company);
      if (company && entries.length === 0) {
        return toolError({
          code: "not_found",
          message: `No timeline entries for company "${company}".`,
          hint: "Use one of the known companies, or omit `company` for the full history.",
          details: { knownCompanies: knownCompanies() },
        });
      }
      return toolResult({
        entries: entries.map(({ duration: _duration, ...e }) => e),
      });
    }
  );
}
