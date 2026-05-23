import { profile } from "../_data/profile";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-[var(--border)] py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="font-mono text-[12px] text-fg-dim">
          © {year} {profile.name}. Built with Next.js.
        </div>
        <div className="flex items-center gap-5 text-[12px] font-mono text-fg-dim">
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-fg transition-colors"
          >
            Email
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-fg transition-colors"
          >
            LinkedIn
          </a>
          <a href="#top" className="hover:text-fg transition-colors">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
