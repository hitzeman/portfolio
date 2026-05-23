import { timeline } from "../_data/profile";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function Timeline() {
  return (
    <section id="journey" className="relative py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionLabel
            index="03"
            kicker="Career"
            title="A through-line of frontend craft and platform thinking."
          />
        </Reveal>

        <div className="relative">
          {/* Vertical rail */}
          <div
            className="absolute left-[11px] md:left-[19px] top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--border-strong) 8%, var(--border-strong) 92%, transparent)",
            }}
            aria-hidden
          />

          <ol className="space-y-14">
            {timeline.map((entry, i) => (
              <li key={i} className="relative pl-12 md:pl-20">
                <Reveal>
                  {/* Node */}
                  <div className="absolute left-0 top-1.5 md:top-2.5 flex items-center justify-center">
                    <div className="relative h-6 w-6 md:h-10 md:w-10 rounded-full bg-bg border border-[var(--border-strong)] flex items-center justify-center">
                      <div
                        className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full"
                        style={{
                          background: i === 0 ? "var(--accent)" : "var(--fg-dim)",
                          boxShadow:
                            i === 0
                              ? "0 0 16px var(--accent)"
                              : "none",
                        }}
                      />
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 md:p-8 group hover:border-[var(--border-strong)] transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl md:text-2xl font-medium tracking-tight">
                            {entry.role}
                          </h3>
                          {entry.badge && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[10px] font-mono uppercase tracking-widest text-[var(--accent)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
                              {entry.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-fg-muted text-sm md:text-base">
                          <span className="text-fg">{entry.company}</span>
                          <span className="text-fg-dim"> · </span>
                          {entry.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[12px] md:text-sm text-fg-muted">
                          {entry.period}
                        </div>
                        {entry.duration && (
                          <div className="font-mono text-[11px] text-fg-dim">
                            {entry.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="mt-5 space-y-3">
                      {entry.highlights.map((h, j) => (
                        <li key={j} className="flex gap-3 text-fg-muted">
                          <span
                            className="mt-2 h-[5px] w-[5px] rounded-full flex-shrink-0"
                            style={{ background: "var(--accent)" }}
                            aria-hidden
                          />
                          <span className="leading-relaxed text-[15px]">
                            {h}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            ))}

            {/* Origin marker */}
            <li className="relative pl-12 md:pl-20">
              <Reveal>
                <div className="absolute left-0 top-2 flex items-center justify-center">
                  <div className="h-6 w-6 md:h-10 md:w-10 rounded-full bg-bg border border-dashed border-[var(--border-strong)] flex items-center justify-center">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-fg-dim"
                      aria-hidden
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                </div>
                <div className="py-2">
                  <div className="font-mono text-[12px] uppercase tracking-[0.28em] text-fg-dim mb-1">
                    Foundation
                  </div>
                  <div className="text-base md:text-lg text-fg">
                    B.S., Information Systems
                  </div>
                  <div className="text-sm text-fg-muted">
                    San Francisco State University
                  </div>
                </div>
              </Reveal>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
