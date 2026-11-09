import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolResult } from "../errors";
import { SKILL_CATEGORIES, listSkills } from "../queries";

export const name = "list_skills";

const inputSchema = {
  category: z
    .enum(SKILL_CATEGORIES as [string, ...string[]])
    .optional()
    .describe(
      `Restrict to one category. One of: ${SKILL_CATEGORIES.join(", ")}. Omit to get every category.`
    ),
};

const outputSchema = {
  categories: z.array(
    z.object({
      key: z.string().describe("Stable identifier, usable as the `category` input."),
      label: z.string().describe("Display name."),
      skills: z.array(z.string()),
    })
  ),
};

export function register(server: McpServer) {
  server.registerTool(
    name,
    {
      title: "List skills",
      description:
        "Lists Todd's skills grouped by category (Frontend, Backend, Cloud, AIEngineering, Practice). Pass `category` to get a single group. Use this to answer 'does Todd know X' style questions; use search_experience to find where a skill was applied.",
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ category }) =>
      toolResult({
        categories: listSkills(category as (typeof SKILL_CATEGORIES)[number] | undefined),
      })
  );
}
