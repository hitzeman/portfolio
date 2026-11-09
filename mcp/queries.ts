import {
  aiEngineering,
  projects,
  skills,
  timeline,
  type ProjectEntry,
  type TimelineEntry,
} from "../app/_data/profile";

/**
 * Pure, synchronous queries over the profile data. Tools stay thin and
 * these functions carry the logic, so they can be unit-tested directly.
 */

export type SkillCategory = keyof typeof skills;

export const SKILL_CATEGORIES = Object.keys(skills) as SkillCategory[];

/** Human-readable label for a skills key, e.g. AIEngineering -> "AI Engineering". */
export function skillCategoryLabel(key: string): string {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // AIEngineering -> AI Engineering
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2"); // SomeNewThing -> Some New Thing
}

export function listSkills(category?: SkillCategory) {
  const keys = category ? [category] : SKILL_CATEGORIES;
  return keys.map((k) => ({
    key: k,
    label: skillCategoryLabel(k),
    skills: [...skills[k]],
  }));
}

export function knownCompanies(): string[] {
  return [...new Set(timeline.map((t) => t.company))];
}

export function getTimeline(company?: string): TimelineEntry[] {
  if (!company) return timeline;
  const needle = company.trim().toLowerCase();
  return timeline.filter((t) => t.company.toLowerCase() === needle);
}

export function listProjects(filter: { context?: string; technology?: string } = {}): ProjectEntry[] {
  const ctx = filter.context?.trim().toLowerCase();
  const tech = filter.technology?.trim().toLowerCase();
  return projects.filter((p) => {
    if (ctx && !p.context.toLowerCase().includes(ctx)) return false;
    if (tech && !p.technologies.some((t) => t.toLowerCase().includes(tech))) return false;
    return true;
  });
}

export function knownTechnologies(): string[] {
  return [...new Set(projects.flatMap((p) => p.technologies))].sort();
}

export type SearchSource = "timeline" | "project" | "skill" | "ai_engineering";

export type SearchHit = {
  source: SearchSource;
  /** Where the snippet came from, e.g. "Senior Software Engineer @ loanDepot". */
  title: string;
  snippet: string;
  /** Distinct query terms matched, plus 1 if the whole phrase matched. Higher is better. */
  score: number;
};

type Candidate = { source: SearchSource; title: string; text: string; order: number };

function candidates(): Candidate[] {
  const out: Candidate[] = [];
  let order = 0;
  for (const t of timeline) {
    const title = `${t.role} @ ${t.company}`;
    for (const h of t.highlights) out.push({ source: "timeline", title, text: h, order: order++ });
  }
  for (const p of projects) {
    out.push({ source: "project", title: p.name, text: p.summary, order: order++ });
    out.push({
      source: "project",
      title: p.name,
      text: `Technologies: ${p.technologies.join(", ")}`,
      order: order++,
    });
    for (const c of p.contributions) out.push({ source: "project", title: p.name, text: c, order: order++ });
    if (p.status) out.push({ source: "project", title: p.name, text: `Status: ${p.status}`, order: order++ });
  }
  for (const [k, list] of Object.entries(skills)) {
    for (const s of list) out.push({ source: "skill", title: skillCategoryLabel(k), text: s, order: order++ });
  }
  for (const p of aiEngineering.practices) out.push({ source: "ai_engineering", title: "Practice", text: p, order: order++ });
  for (const e of aiEngineering.evidence) out.push({ source: "ai_engineering", title: "Evidence", text: e, order: order++ });
  return out;
}

export function tokenize(query: string): string[] {
  return [
    ...new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9.#+]+/)
        .map((t) => t.replace(/^[.]+|[.]+$/g, ""))
        .filter((t) => t.length >= 2)
    ),
  ];
}

/**
 * Keyword search across highlights, projects, skills, and AI practices.
 * Scoring is deliberately simple and explainable: one point per distinct
 * query term found in the text, plus one if the full phrase appears.
 */
export function searchExperience(query: string, limit = 5): SearchHit[] {
  const phrase = query.trim().toLowerCase();
  const terms = tokenize(query);
  if (terms.length === 0 && phrase.length === 0) return [];

  const scored: (SearchHit & { order: number })[] = [];
  for (const c of candidates()) {
    const hay = `${c.title} ${c.text}`.toLowerCase();
    let score = terms.filter((t) => hay.includes(t)).length;
    if (phrase.length >= 3 && hay.includes(phrase)) score += 1;
    if (score > 0) {
      scored.push({ source: c.source, title: c.title, snippet: c.text, score, order: c.order });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, limit).map(({ order: _order, ...hit }) => hit);
}
