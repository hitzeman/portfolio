import { skills } from "../_data/profile";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const categoryMeta: Record<
  string,
  { num: string; tint: string; description: string }
> = {
  Frontend: {
    num: "01",
    tint: "var(--accent)",
    description: "Where I spend most of my time. Architecture, performance, and pixel-perfect UI at scale.",
  },
  Backend: {
    num: "02",
    tint: "var(--accent-2)",
    description: "Enough depth across the stack to design frontend solutions that respect production reality.",
  },
  Cloud: {
    num: "03",
    tint: "var(--accent-3)",
    description: "Shipping and operating apps in Azure with disciplined CI/CD and observability.",
  },
  Practice: {
    num: "04",
    tint: "var(--accent)",
    description: "How I work: mentor, reviewer, experimenter — quality is a system, not a step.",
  },
};

export default function Skills() {
  const allTags = Object.values(skills).flat();

  return (
    <section id="skills" className="relative py-32 md:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-60" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--bg) 75%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionLabel
            index="02"
            kicker="Skills"
            title="The toolkit — sharpened across nine years of shipping enterprise software."
          />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          {Object.entries(skills).map(([category, items], i) => {
            const meta = categoryMeta[category];
            return (
              <Reveal key={category} delay={i * 90}>
                <div className="group h-full glass rounded-2xl p-7 relative overflow-hidden transition-colors hover:border-[var(--border-strong)]">
                  <div
                    className="absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-0 group-hover:opacity-25 blur-3xl transition-opacity duration-700"
                    style={{ background: meta.tint }}
                    aria-hidden
                  />

                  <div className="relative flex items-start justify-between mb-5">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-fg-dim">
                        {meta.num} / Discipline
                      </div>
                      <h3 className="mt-1.5 text-2xl md:text-3xl font-medium tracking-tight">
                        {category}
                      </h3>
                    </div>
                    <span
                      className="h-2 w-2 rounded-full mt-3"
                      style={{ background: meta.tint, boxShadow: `0 0 14px ${meta.tint}` }}
                    />
                  </div>

                  <p className="relative text-sm text-fg-muted mb-6 max-w-md leading-relaxed">
                    {meta.description}
                  </p>

                  <div className="relative flex flex-wrap gap-2">
                    {items.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Marquee */}
        <div className="mt-16 marquee-pause relative overflow-hidden border-y border-[var(--border)] py-5 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee-track flex gap-3 whitespace-nowrap w-max">
            {[...allTags, ...allTags].map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm text-fg-muted font-mono"
              >
                <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
