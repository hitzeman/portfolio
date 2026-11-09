import { describe, expect, it } from "vitest";
import { projects, skills, timeline } from "../app/_data/profile";
import {
  SKILL_CATEGORIES,
  getTimeline,
  knownCompanies,
  listProjects,
  listSkills,
  searchExperience,
  skillCategoryLabel,
  tokenize,
} from "./queries";

describe("listSkills", () => {
  it("returns every category with a readable label", () => {
    const all = listSkills();
    expect(all.map((c) => c.key)).toEqual(SKILL_CATEGORIES);
    expect(all.find((c) => c.key === "AIEngineering")?.label).toBe("AI Engineering");
    expect(all.find((c) => c.key === "Frontend")?.skills).toEqual(skills.Frontend);
  });

  it("filters to one category", () => {
    expect(listSkills("Cloud")).toHaveLength(1);
    expect(listSkills("Cloud")[0].skills).toEqual(skills.Cloud);
  });

  it("labels split camel case", () => {
    expect(skillCategoryLabel("Frontend")).toBe("Frontend");
    expect(skillCategoryLabel("SomeNewThing")).toBe("Some New Thing");
  });
});

describe("getTimeline", () => {
  it("returns the full timeline unfiltered", () => {
    expect(getTimeline()).toBe(timeline);
  });

  it("matches company case-insensitively", () => {
    const hits = getTimeline("LOANDEPOT");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.company === "loanDepot")).toBe(true);
  });

  it("returns nothing for an unknown company and lists known ones", () => {
    expect(getTimeline("Acme")).toEqual([]);
    expect(knownCompanies()).toContain("loanDepot");
  });
});

describe("listProjects", () => {
  it("returns everything with no filter", () => {
    expect(listProjects()).toEqual(projects);
  });

  it("filters by context and technology substrings", () => {
    const cmh = listProjects({ context: "cmh" });
    expect(cmh.length).toBeGreaterThan(0);
    expect(cmh.every((p) => /cmhworks/i.test(p.context))).toBe(true);

    const lambda = listProjects({ technology: "lambda" });
    expect(lambda.every((p) => p.technologies.some((t) => /lambda/i.test(t)))).toBe(true);
    expect(lambda.length).toBeGreaterThan(0);
  });

  it("combines filters with AND", () => {
    expect(listProjects({ context: "cmhworks", technology: "angular" })).toEqual([]);
  });
});

describe("tokenize", () => {
  it("lowercases, splits, dedupes, and keeps tech tokens", () => {
    expect(tokenize("Angular SSR, angular .NET C# node.js")).toEqual([
      "angular",
      "ssr",
      "net",
      "c#",
      "node.js",
    ]);
  });

  it("drops one-character noise", () => {
    expect(tokenize("a b of x")).toEqual(["of"]);
  });
});

describe("searchExperience", () => {
  it("ranks snippets matching more terms first", () => {
    const hits = searchExperience("Angular SSR migration");
    expect(hits.length).toBeGreaterThan(0);
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
    }
    // The title (e.g. the project name) is part of what is matched.
    expect(`${hits[0].title} ${hits[0].snippet}`.toLowerCase()).toContain("angular");
    expect(hits[0].score).toBeGreaterThanOrEqual(2);
  });

  it("gives a phrase bonus", () => {
    const [top] = searchExperience("HTML-to-PDF");
    expect(top.snippet.toLowerCase()).toContain("html-to-pdf");
  });

  it("returns verbatim snippets with a source and title", () => {
    const hits = searchExperience("Puppeteer");
    expect(hits.some((h) => h.source === "project")).toBe(true);
    expect(hits.some((h) => h.source === "skill")).toBe(true);
    const allText = [
      ...timeline.flatMap((t) => t.highlights),
      ...projects.flatMap((p) => [p.summary, ...p.contributions]),
      ...Object.values(skills).flat(),
    ];
    for (const h of hits) {
      if (h.source !== "ai_engineering" && !/^(Status|Technologies):/.test(h.snippet)) {
        expect(allText).toContain(h.snippet);
      }
    }
  });

  it("respects the limit", () => {
    expect(searchExperience("angular", 2)).toHaveLength(2);
  });

  it("returns an empty list for nonsense", () => {
    expect(searchExperience("zxqvbn plorth")).toEqual([]);
  });
});
