import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, SERVER_NAME } from "./server";
import { TOOL_NAMES } from "./tools/index";
import type { AskModel } from "./tools/ask-digital-twin";

type ToolCall = Awaited<ReturnType<Client["callTool"]>>;

function textOf(result: ToolCall): string {
  const content = result.content as Array<{ type: string; text?: string }>;
  return content.find((c) => c.type === "text")?.text ?? "";
}

function parseText(result: ToolCall): unknown {
  return JSON.parse(textOf(result));
}

/**
 * The SDK validates arguments against the zod schema before the handler
 * runs and reports a violation as an error *result* carrying the JSON-RPC
 * InvalidParams code (-32602), so the agent sees a structured error rather
 * than a transport failure and the handler is never reached.
 */
async function expectInvalidArgs(call: Promise<ToolCall>) {
  const result = await call;
  expect(result.isError).toBe(true);
  expect(textOf(result)).toMatch(/-32602/);
  expect(textOf(result)).toMatch(/Invalid arguments/i);
}

async function connect(askModel?: AskModel) {
  const server = createServer(askModel ? { askModel } : {});
  const client = new Client({ name: "test-client", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    server,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

describe("MCP server (in-process integration)", () => {
  let conn: Awaited<ReturnType<typeof connect>>;

  beforeEach(async () => {
    conn = await connect();
  });
  afterEach(async () => {
    await conn.close();
  });

  it("identifies itself and lists exactly the registered tools", async () => {
    expect(conn.client.getServerVersion()?.name).toBe(SERVER_NAME);
    const { tools } = await conn.client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
    for (const t of tools) {
      expect(t.description, `${t.name} needs a description`).toBeTruthy();
      expect(t.inputSchema.type).toBe("object");
      expect(t.outputSchema?.type, `${t.name} needs an outputSchema`).toBe("object");
      expect(t.annotations?.readOnlyHint).toBe(true);
    }
  });

  it("get_profile returns the public profile", async () => {
    const r = await conn.client.callTool({ name: "get_profile", arguments: {} });
    expect(r.isError).toBeFalsy();
    const sc = r.structuredContent as Record<string, unknown>;
    expect(sc.name).toBe("Todd Hitzeman");
    expect(sc).toHaveProperty("contact.linkedin");
    expect(parseText(r)).toEqual(sc);
  });

  it("list_skills: valid category, and every category by default", async () => {
    const one = await conn.client.callTool({
      name: "list_skills",
      arguments: { category: "Cloud" },
    });
    const sc = one.structuredContent as { categories: { key: string }[] };
    expect(sc.categories).toHaveLength(1);
    expect(sc.categories[0].key).toBe("Cloud");

    const all = await conn.client.callTool({ name: "list_skills", arguments: {} });
    expect((all.structuredContent as { categories: unknown[] }).categories.length).toBeGreaterThan(3);
  });

  it("list_skills rejects an unknown category at the protocol boundary", async () => {
    await expectInvalidArgs(
      conn.client.callTool({ name: "list_skills", arguments: { category: "Cooking" } })
    );
  });

  it("get_timeline filters and returns a structured not_found for unknown companies", async () => {
    const ok = await conn.client.callTool({
      name: "get_timeline",
      arguments: { company: "loandepot" },
    });
    expect(ok.isError).toBeFalsy();
    const entries = (ok.structuredContent as { entries: { company: string }[] }).entries;
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.company === "loanDepot")).toBe(true);

    const missing = await conn.client.callTool({
      name: "get_timeline",
      arguments: { company: "Initech" },
    });
    expect(missing.isError).toBe(true);
    const body = parseText(missing) as { error: { code: string; details: { knownCompanies: string[] } } };
    expect(body.error.code).toBe("not_found");
    expect(body.error.details.knownCompanies).toContain("loanDepot");
  });

  it("get_timeline rejects an over-long company name", async () => {
    await expectInvalidArgs(
      conn.client.callTool({ name: "get_timeline", arguments: { company: "x".repeat(101) } })
    );
  });

  it("list_projects filters and helps when nothing matches", async () => {
    const hit = await conn.client.callTool({
      name: "list_projects",
      arguments: { technology: "Puppeteer" },
    });
    const sc = hit.structuredContent as { total: number; projects: unknown[] };
    expect(sc.total).toBeGreaterThan(0);
    expect(sc.projects).toHaveLength(sc.total);

    const none = await conn.client.callTool({
      name: "list_projects",
      arguments: { technology: "COBOL" },
    });
    expect(none.isError).toBeFalsy();
    const empty = none.structuredContent as { total: number; availableTechnologies: string[] };
    expect(empty.total).toBe(0);
    expect(empty.availableTechnologies.length).toBeGreaterThan(0);
  });

  it("list_projects rejects wrong argument types", async () => {
    await expectInvalidArgs(
      conn.client.callTool({ name: "list_projects", arguments: { technology: 42 } })
    );
  });

  it("search_experience returns ranked hits and applies the limit", async () => {
    const r = await conn.client.callTool({
      name: "search_experience",
      arguments: { query: "Angular SSR", limit: 3 },
    });
    const sc = r.structuredContent as { query: string; results: { score: number }[] };
    expect(sc.query).toBe("Angular SSR");
    expect(sc.results.length).toBeLessThanOrEqual(3);
    expect(sc.results.length).toBeGreaterThan(0);
  });

  it("search_experience rejects out-of-range inputs", async () => {
    await expectInvalidArgs(
      conn.client.callTool({ name: "search_experience", arguments: { query: "a" } })
    );
    await expectInvalidArgs(
      conn.client.callTool({ name: "search_experience", arguments: { query: "angular", limit: 0 } })
    );
    await expectInvalidArgs(
      conn.client.callTool({ name: "search_experience", arguments: { query: "angular", limit: 21 } })
    );
  });

  it("ask_digital_twin returns not_configured without a key, and never calls the model", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const r = await conn.client.callTool({
      name: "ask_digital_twin",
      arguments: { question: "Are you open to staff roles?" },
    });
    expect(r.isError).toBe(true);
    expect((parseText(r) as { error: { code: string } }).error.code).toBe("not_configured");
  });

  it("calling an unknown tool is a structured error, not a crash", async () => {
    const r = await conn.client.callTool({ name: "delete_everything", arguments: {} });
    expect(r.isError).toBe(true);
    expect(textOf(r)).toMatch(/not found/i);
    // The server is still healthy afterwards.
    const again = await conn.client.callTool({ name: "get_profile", arguments: {} });
    expect(again.isError).toBeFalsy();
  });
});

describe("ask_digital_twin with a mocked model", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
  });

  it("passes history + question to the model and returns its answer", async () => {
    const askModel = vi.fn<AskModel>().mockResolvedValue("Yes — I'm open to staff roles.");
    const conn = await connect(askModel);
    try {
      const r = await conn.client.callTool({
        name: "ask_digital_twin",
        arguments: {
          question: "Staff roles?",
          history: [
            { role: "user", content: "Hi" },
            { role: "assistant", content: "Hello" },
          ],
        },
      });
      expect(r.isError).toBeFalsy();
      expect(r.structuredContent).toEqual({
        answer: "Yes — I'm open to staff roles.",
        model: expect.any(String),
      });
      expect(askModel).toHaveBeenCalledWith([
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello" },
        { role: "user", content: "Staff roles?" },
      ]);
    } finally {
      await conn.close();
    }
  });

  it("maps upstream failures to structured, actionable errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const cases: Array<[unknown, string]> = [
      [Object.assign(new Error("t"), { name: "TimeoutError" }), "upstream_timeout"],
      [Object.assign(new Error("429"), { status: 429, headers: new Headers({ "retry-after": "3" }) }), "rate_limited"],
      [Object.assign(new Error("bad key sk-live-1"), { status: 401 }), "upstream_auth"],
      [new Error("boom"), "upstream_error"],
    ];
    for (const [thrown, code] of cases) {
      const conn = await connect(vi.fn<AskModel>().mockRejectedValue(thrown));
      try {
        const r = await conn.client.callTool({
          name: "ask_digital_twin",
          arguments: { question: "hi" },
        });
        expect(r.isError).toBe(true);
        const body = parseText(r) as { error: { code: string; message: string; hint: string } };
        expect(body.error.code).toBe(code);
        expect(body.error.hint).toBeTruthy();
        expect(body.error.message).not.toContain("sk-live");
      } finally {
        await conn.close();
      }
    }
  });

  it("rejects an empty question and an over-long history", async () => {
    const conn = await connect(vi.fn<AskModel>());
    try {
      await expectInvalidArgs(
        conn.client.callTool({ name: "ask_digital_twin", arguments: { question: "   " } })
      );
      await expectInvalidArgs(
        conn.client.callTool({
          name: "ask_digital_twin",
          arguments: {
            question: "hi",
            history: Array.from({ length: 11 }, () => ({ role: "user", content: "x" })),
          },
        })
      );
    } finally {
      await conn.close();
    }
  });
});
