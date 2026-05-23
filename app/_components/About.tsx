import { profile } from "../_data/profile";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function About() {
  return (
    <section id="about" className="relative py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionLabel index="01" kicker="About" title="A frontend architect who treats UI as infrastructure." />
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 space-y-7">
            {profile.about.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="text-lg md:text-xl text-fg-muted leading-relaxed">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={120}>
              <div className="glass rounded-2xl p-7 relative overflow-hidden">
                <div
                  className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-30 blur-3xl"
                  style={{ background: "var(--accent-2)" }}
                  aria-hidden
                />
                <div className="relative">
                  <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-fg-dim mb-5">
                    Currently
                  </div>
                  <div className="space-y-5">
                    <Row label="Role" value="Sr. Software Engineer" />
                    <Row label="Company" value="loanDepot" />
                    <Row label="Focus" value="Angular SSR/SSG · Shared UI" />
                    <Row label="Stack" value="Angular · .NET · Azure" />
                    <Row label="Based in" value={profile.location} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-[var(--border)]">
                    <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-fg-dim mb-3">
                      Education
                    </div>
                    <div className="text-sm text-fg">
                      B.S., Information Systems
                    </div>
                    <div className="text-sm text-fg-muted">
                      San Francisco State University
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-fg-dim font-mono text-[12px] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-fg text-right">{value}</span>
    </div>
  );
}
