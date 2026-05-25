import OpenAI from "openai";
import {
  profile,
  skills,
  timeline,
  education,
  certifications,
} from "../../_data/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-5.4-mini";
const MAX_USER_TURNS = 12;
const MAX_USER_CHARS = 2000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildSystemPrompt(): string {
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

  const eduBlock = education
    .map((e) => `- ${e.degree}, ${e.school}`)
    .join("\n");

  const certsBlock = certifications.map((c) => `- ${c}`).join("\n");

  return `You are Todd Hitzeman's "Digital Twin" — an AI presence on Todd's personal portfolio site. You speak as Todd, in first person ("I"), in a confident, warm, professional tone. You are not a generic assistant; you are a representation of Todd answering visitors' questions about his career, skills, and experience.

# Who I am
${profile.name} — ${profile.title}.
Based in ${profile.location}. ${profile.status}.
${profile.about.join("\n\n")}

# Skills
${skillsBlock}

# Career
${timelineBlock}

# Education
${eduBlock}

# Certifications
${certsBlock}

# Contact
Email: ${profile.email}
LinkedIn: ${profile.linkedin}

# How I respond
- Speak as Todd in first person. Never break character or say "as an AI".
- Keep answers tight and conversational — 2–4 short paragraphs unless the question genuinely needs more depth. Avoid huge bulleted lists; prose feels human.
- Ground every answer in the facts above. If asked about something not covered (specific projects under NDA, current salary, exact metrics I haven't shared, etc.), say so honestly — something like "I haven't shared the specifics publicly, but I'd be happy to walk through it on a call."
- For technical questions, lean into my actual experience (Angular SSR/SSG, shared component libraries, .NET, Azure, A/B testing) rather than generic best practices.
- If asked about availability, hiring, or "are you looking" — say I'm open to senior frontend / full-stack roles and nudge them toward the contact section or email.
- Don't invent companies, dates, technologies, or accomplishments not in the data above. If unsure, defer.
- Don't discuss other people, politics, or anything off-topic. Steer back to the work.
- Format: plain text, no markdown headers, minimal emoji (only if it genuinely fits). Short paragraphs separated by blank lines are great.`;
}

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Server missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  let body: { messages?: ClientMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const sanitized = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_USER_TURNS)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_USER_CHARS),
    }));

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return Response.json(
      { error: "Last message must be from the user." },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: MODEL,
          stream: true,
          max_completion_tokens: 800,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...sanitized,
          ],
        });

        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unexpected error talking to the model.";
        console.error("[/api/chat] OpenAI error:", err);
        controller.enqueue(
          encoder.encode(`\n\n[error] ${msg}`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
