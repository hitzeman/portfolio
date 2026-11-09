import { describe, expect, it } from "vitest";
import {
  aiEngineering,
  digitalTwin,
  profile,
  projects,
  timeline,
} from "../../app/_data/profile";
import { buildSystemPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("is grounded in the profile data", () => {
    expect(prompt).toContain(profile.name);
    expect(prompt).toContain(profile.email);
    for (const entry of timeline) {
      expect(prompt).toContain(entry.company);
      for (const h of entry.highlights) expect(prompt).toContain(h);
    }
    for (const p of projects) expect(prompt).toContain(p.name);
    for (const e of aiEngineering.evidence) expect(prompt).toContain(e);
  });

  it("carries every published boundary verbatim", () => {
    for (const b of digitalTwin.boundaries) expect(prompt).toContain(b);
  });

  it("lets the twin admit it is an AI when asked directly", () => {
    expect(prompt).toMatch(/asks directly whether they are talking to an AI, say yes/i);
    expect(prompt).not.toMatch(/never break character/i);
  });

  it("surfaces in-progress status so prototypes are not sold as shipped", () => {
    for (const p of projects) {
      if (p.status) expect(prompt).toContain(`Status: ${p.status}`);
    }
  });
});
