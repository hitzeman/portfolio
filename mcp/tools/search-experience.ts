import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolResult } from "../errors";
import { searchExperience } from "../queries";

export const name = "search_experience";

const inputSchema = {
  query: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .describe("Keywords or a short phrase, e.g. \"Angular SSR migration\" or \"Puppeteer\"."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Maximum number of hits to return (1-20, default 5)."),
};

const outputSchema = {
  query: z.string(),
  results: z.array(
    z.object({
      source: z.enum(["timeline", "project", "skill", "ai_engineering"]),
      title: z.string().describe("Role @ company, project name, skill category, or AI-practice bucket."),
      snippet: z.string().describe("The matching sentence, verbatim from the profile."),
      score: z.number().int().describe("Distinct query terms matched (+1 for a full-phrase match)."),
    })
  ),
  suggestion: z.string().optional().describe("Present when there were no hits."),
};

export function register(server: McpServer) {
  server.registerTool(
    name,
    {
      title: "Search experience",
      description:
        "Keyword search across Todd's career highlights, projects, skills, and AI-engineering practices. Returns verbatim snippets ranked by how many query terms they match, so answers can be quoted rather than paraphrased. Best for 'has Todd done X' questions.",
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ query, limit }) => {
      const results = searchExperience(query, limit);
      return toolResult({
        query,
        results,
        ...(results.length === 0
          ? {
              suggestion:
                "No matches. Try broader or alternative terms, or call list_skills / list_projects to see what is documented.",
            }
          : {}),
      });
    }
  );
}
