import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { certifications, education, profile } from "../../app/_data/profile";
import { toolResult } from "../errors";

export const name = "get_profile";

const outputSchema = {
  name: z.string(),
  title: z.string(),
  subtitle: z.string(),
  location: z.string(),
  status: z.string().describe("Current availability statement."),
  tagline: z.string(),
  about: z.array(z.string()).describe("Bio paragraphs, in order."),
  stats: z.array(z.object({ label: z.string(), value: z.string() })),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    linkedin: z.string().url(),
  }),
  education: z.array(z.object({ school: z.string(), degree: z.string() })),
  certifications: z.array(z.string()),
};

export function register(server: McpServer) {
  server.registerTool(
    name,
    {
      title: "Get profile",
      description:
        "Returns Todd Hitzeman's public professional profile: name, title, location, availability status, bio, headline stats, contact details, education, and certifications. Takes no arguments. Call this first for an overview before using the more specific tools.",
      inputSchema: {},
      outputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () =>
      toolResult({
        name: profile.name,
        title: profile.title,
        subtitle: profile.subtitle,
        location: profile.location,
        status: profile.status,
        tagline: profile.tagline,
        about: profile.about,
        stats: profile.stats,
        contact: {
          email: profile.email,
          phone: profile.phone,
          linkedin: profile.linkedin,
        },
        education,
        certifications,
      })
  );
}
