import { profile } from "../_data/profile";

export default function Hero() {
  const first = profile.firstName;
  const last = profile.lastName;

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-20"
    >
      <div className="aurora" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-70" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, transparent 0%, var(--bg) 75%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
        {/* Top meta row */}
        <div
          className="flex flex-wrap items-center gap-3 mb-10 fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-strong)] bg-white/[0.02] text-[12px] font-mono text-fg-muted">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-70 pulse-dot" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            {profile.status}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] text-[12px] font-mono text-fg-dim">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {profile.location}
          </span>
        </div>

        {/* Eyebrow */}
        <p
          className="text-[12px] font-mono uppercase tracking-[0.32em] text-fg-dim mb-6 fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <span className="text-[var(--accent)]">/</span> {profile.title}
        </p>

        {/* Name */}
        <h1
          className="font-sans font-medium tracking-[-0.04em] leading-[0.88] text-[clamp(3.4rem,12vw,11rem)] fade-up"
          style={{ animationDelay: "260ms" }}
        >
          <span className="block text-gradient-soft">
            {first.split("").map((c, i) => (
              <span key={`f-${i}`} className="letter">
                {c}
              </span>
            ))}
          </span>
          <span className="block">
            {last.split("").map((c, i) => (
              <span
                key={`l-${i}`}
                className="letter text-gradient"
                style={{
                  WebkitTextFillColor: "transparent",
                }}
              >
                {c}
              </span>
            ))}
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="mt-10 max-w-2xl text-lg md:text-xl text-fg-muted leading-relaxed fade-up"
          style={{ animationDelay: "420ms" }}
        >
          {profile.tagline}
        </p>

        {/* CTA row */}
        <div
          className="mt-12 flex flex-wrap items-center gap-4 fade-up"
          style={{ animationDelay: "520ms" }}
        >
          <a
            href="#journey"
            className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)] text-black text-sm font-medium hover:bg-white transition-colors"
          >
            View my journey
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[var(--border-strong)] text-sm text-fg hover:bg-white/[0.04] transition-colors"
          >
            Get in touch
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="link-underline text-sm text-fg-muted hover:text-fg ml-1"
          >
            LinkedIn
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </div>

        {/* Stat strip */}
        <div
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border)] rounded-2xl overflow-hidden border border-[var(--border)] fade-up"
          style={{ animationDelay: "640ms" }}
        >
          {profile.stats.map((s) => (
            <div
              key={s.label}
              className="bg-bg p-5 md:p-6 hover:bg-white/[0.02] transition-colors"
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-fg-dim">
                {s.label}
              </div>
              <div className="mt-2 text-xl md:text-2xl font-medium text-fg">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full mt-16 hidden md:flex items-center gap-3 text-fg-dim text-[11px] font-mono uppercase tracking-[0.28em]">
        <span className="block h-px w-12 bg-[var(--border-strong)]" />
        Scroll
      </div>
    </section>
  );
}
