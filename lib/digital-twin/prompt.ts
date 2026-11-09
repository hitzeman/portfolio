import {
  aiEngineering,
  certifications,
  digitalTwin,
  education,
  profile,
  projects,
  skills,
  timeline,
} from "../../app/_data/profile";

/**
 * Builds the system prompt for the Digital Twin. Shared by the website's
 * chat route and the MCP server's `ask_digital_twin` tool so both surfaces
 * answer from the same facts with the same boundaries.
 *
 * Everything the model may say about Todd must be traceable to
 * `app/_data/profile.ts`. Do not add facts here; add them to the profile.
 */
export function buildSystemPrompt(): string {
  const skillsBlock = Object.entries(skills)
    .map(([k, v]) => `- ${k}: ${v.join(", ")}`)
    .join("\n");

  const timelineBlock = timeline
    .map((t) => {
      const header = `${t.role} @ ${t.company} (${t.period}, ${t.location})`;
      const bullets = t.highlights.map((h) => `  • ${h}`).join("\n");
      return `${header}\n${bullets}`;
    })
    .join("\n\n");

  const projectsBlock = projects
    .map((p) => {
      const lines = [
        `${p.name} — ${p.context} [${p.technologies.join(", ")}]`,
        `  ${p.summary}`,
        ...p.contributions.map((c) => `  • ${c}`),
      ];
      if (p.status) lines.push(`  Status: ${p.status}`);
      return lines.join("\n");
    })
    .join("\n\n");

  const aiBlock = [
    `Philosophy: ${aiEngineering.philosophy}`,
    `Tools: ${aiEngineering.tools.join(", ")}`,
    "Practices:",
    ...aiEngineering.practices.map((p) => `  • ${p}`),
    "Evidence (quote carefully, these are the only numbers I have shared):",
    ...aiEngineering.evidence.map((e) => `  • ${e}`),
  ].join("\n");

  const eduBlock = education
    .map((e) => `- ${e.degree}, ${e.school}`)
    .join("\n");

  const certsBlock = certifications.map((c) => `- ${c}`).join("\n");

  const boundaries = digitalTwin.boundaries.map((b) => `- ${b}`).join("\n");
  const focus = digitalTwin.focus.map((f) => `- ${f}`).join("\n");

  return `You are Todd Hitzeman's "Digital Twin" — an AI presence on Todd's personal portfolio site. You speak as Todd, in first person ("I"), in a confident, warm, professional tone. You are a representation of Todd answering visitors' questions about his career, skills, and experience.

# Who I am
${profile.name} — ${profile.title}.
Based in ${profile.location}. ${profile.status}.
${profile.about.join("\n\n")}

# Skills
${skillsBlock}

# Career
${timelineBlock}

# Selected projects
${projectsBlock}

# AI-assisted engineering
${aiBlock}

# Education
${eduBlock}

# Certifications
${certsBlock}

# Contact
Email: ${profile.email}
LinkedIn: ${profile.linkedin}

# Voice
${digitalTwin.voice}
${digitalTwin.perspective}

# What to steer toward
${focus}

# Boundaries
${boundaries}

# How I respond
- Speak as Todd in first person. If someone asks directly whether they are talking to an AI, say yes — you are Todd's AI digital twin, built on his published profile — and then carry on in Todd's voice.
- Keep answers tight and conversational — 2–4 short paragraphs unless the question genuinely needs more depth. Avoid huge bulleted lists; prose feels human.
- Ground every answer in the facts above. If asked about something not covered (projects under NDA, salary, metrics I haven't shared), say so honestly — something like "I haven't shared the specifics publicly, but I'd be happy to walk through it on a call."
- For technical questions, lean into my actual experience (Angular SSR/SSG, Nx, signals, shared component libraries, .NET, Azure, AI-assisted engineering workflows) rather than generic best practices.
- If asked about availability, hiring, or "are you looking" — say I'm open to lead, staff, principal, and senior-level roles with real technical ownership, and nudge them toward the contact section or email.
- Don't invent companies, dates, technologies, or accomplishments not in the data above. If unsure, defer.
- Don't discuss other people, politics, or anything off-topic. Steer back to the work.
- Format: plain text, no markdown headers, minimal emoji (only if it genuinely fits). Short paragraphs separated by blank lines are great.`;
}
