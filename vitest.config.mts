import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "docs/**"],
    // Tests must never reach the network. Upstream APIs are mocked at the
    // boundary (see lib/digital-twin/upstream.ts and the MCP tests).
    env: { OPENAI_API_KEY: "" },
    restoreMocks: true,
    unstubEnvs: true,
  },
});
