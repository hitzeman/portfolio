import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const cards = [
  {
    tag: "Frontend Platform",
    title: "Angular SSR/SSG Platform",
    blurb:
      "A case study on shipping server-rendered Angular at scale — performance budgets, hydration strategy, and SEO.",
    stack: ["Angular", "SSR", "Performance"],
  },
  {
    tag: "Design System",
    title: "Shared UI Component Library",
    blurb:
      "How a multi-team component library evolved into the source of truth for design and engineering consistency.",
    stack: ["Design System", "TypeScript", "Tokens"],
  },
  {
    tag: "Modernization",
    title: ".NET MVC → Angular Migration",
    blurb:
      "The playbook for migrating legacy MVC apps to API-driven Angular frontends without downtime.",
    stack: [".NET", "Angular", "Strangler"],
  },
  {
    tag: "Experimentation",
    title: "A/B Testing & Conversion Lift",
    blurb:
      "Applying analytics and experimentation to drive measurable UI improvements on customer-facing flows.",
    stack: ["A/B Testing", "Analytics"],
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative py-32 md:py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14 md:mb-20">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.32em] text-fg-dim mb-5">
                <span className="text-[var(--accent)]">04</span>
                <span className="block h-px w-10 bg-[var(--border-strong)]" />
                <span>Work</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-gradient-soft max-w-3xl">
                Selected work — case studies in progress.
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-strong)] bg-white/[0.02] text-[12px] font-mono text-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-3)] pulse-dot" />
              Coming soon
            </span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <article className="group relative h-full glass rounded-2xl p-7 overflow-hidden hover:border-[var(--border-strong)] transition-all">
                {/* Reveal sheen */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mx,50%) var(--my,0%), rgba(124,249,255,0.08), transparent 40%)",
                  }}
                  aria-hidden
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-fg-dim">
                      {c.tag}
                    </span>
                    <span className="text-[11px] font-mono text-fg-dim border border-[var(--border)] rounded-full px-2.5 py-0.5">
                      Soon
                    </span>
                  </div>

                  {/* Visual */}
                  <div className="relative h-44 rounded-xl border border-[var(--border)] bg-gradient-to-br from-white/[0.03] to-transparent mb-6 overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
                    <div
                      className="absolute -inset-4 opacity-50 blur-2xl group-hover:opacity-80 transition-opacity"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 45%), radial-gradient(circle at 70% 70%, var(--accent-2) 0%, transparent 45%)",
                      }}
                      aria-hidden
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-fg/70 group-hover:text-fg transition-colors"
                        aria-hidden
                      >
                        <rect x="3" y="4" width="18" height="14" rx="2" />
                        <path d="M3 8h18M8 14h8" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-fg-muted leading-relaxed mb-5">
                    {c.blurb}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {c.stack.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 text-center text-sm text-fg-muted">
            Want a deeper look before the case studies are live?{" "}
            <a href="#contact" className="link-underline text-fg">
              Reach out
            </a>
            .
          </div>
        </Reveal>
      </div>
    </section>
  );
}
