import { profile } from "../_data/profile";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="relative py-32 md:py-40 overflow-hidden">
      <div className="aurora opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-50" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom, transparent 0%, var(--bg) 70%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <Reveal>
          <div className="text-[11px] font-mono uppercase tracking-[0.32em] text-fg-dim mb-6">
            <span className="text-[var(--accent)]">05</span> / Contact
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-0.03em] leading-[0.95] text-gradient-soft">
            Let&apos;s build something
            <br />
            <span className="text-gradient">worth shipping.</span>
          </h2>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-8 text-lg md:text-xl text-fg-muted max-w-2xl mx-auto leading-relaxed">
            Open to senior frontend and full-stack opportunities. If you&apos;re
            looking for someone to own a frontend platform end-to-end — let&apos;s
            talk.
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-full border border-[var(--border-strong)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-fg">{profile.email}</span>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[var(--accent)] text-black group-hover:bg-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--border)] rounded-2xl overflow-hidden border border-[var(--border)] max-w-3xl mx-auto">
            <ChannelCard
              label="Email"
              value={profile.email}
              href={`mailto:${profile.email}`}
              icon={
                <>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </>
              }
            />
            <ChannelCard
              label="LinkedIn"
              value="todd-hitzeman"
              href={profile.linkedin}
              external
              icon={
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M8 10v8M8 7v.01M12 18v-5a2 2 0 0 1 4 0v5M16 18v-3" />
                </>
              }
            />
            <ChannelCard
              label="Phone"
              value={profile.phone}
              href={`tel:${profile.phone.replace(/\./g, "")}`}
              icon={
                <>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </>
              }
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChannelCard({
  label,
  value,
  href,
  icon,
  external,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className="group bg-bg p-6 md:p-7 text-left hover:bg-white/[0.025] transition-colors flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-fg-muted group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {icon}
          </svg>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-fg-dim group-hover:text-fg transition-colors group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </div>
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-fg-dim">
          {label}
        </div>
        <div className="mt-1 text-fg text-sm break-all">{value}</div>
      </div>
    </a>
  );
}
