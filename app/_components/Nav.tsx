"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "portfolio", label: "Work" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("about");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 backdrop-blur-xl bg-black/40 border-b border-[var(--border)]"
          : "py-5 bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <a
          href="#top"
          className="group flex items-center gap-2.5 text-sm font-mono tracking-tight"
        >
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-70 pulse-dot" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent)]" />
          </span>
          <span className="text-fg-muted group-hover:text-fg transition-colors">
            todd<span className="text-[var(--accent)]">.</span>hitzeman
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`relative px-3.5 py-2 text-[13px] tracking-wide rounded-full transition-colors ${
                  active === s.id
                    ? "text-fg"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {active === s.id && (
                  <span className="absolute inset-0 rounded-full bg-white/[0.06] border border-[var(--border-strong)]" />
                )}
                <span className="relative">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-black bg-[var(--accent)] rounded-full hover:bg-white transition-colors"
        >
          Let&apos;s talk
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 -mr-2 text-fg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-[var(--border)]">
          <ul className="px-6 py-4 flex flex-col gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-fg-muted hover:text-fg border-b border-[var(--border)] last:border-0"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-black bg-[var(--accent)] rounded-full"
              >
                Let&apos;s talk
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
