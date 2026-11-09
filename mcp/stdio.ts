import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server";

/**
 * Production entry point: `npm run mcp` (tsx mcp/stdio.ts).
 * stdout is the protocol channel, so all logging goes to stderr.
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[mcp] ${SERVER_NAME} v${SERVER_VERSION} ready on stdio`);

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[mcp] fatal", err);
  process.exit(1);
});
