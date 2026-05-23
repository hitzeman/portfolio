type Props = {
  index: string;
  title: string;
  kicker?: string;
};

export default function SectionLabel({ index, title, kicker }: Props) {
  return (
    <div className="mb-14 md:mb-20">
      <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.32em] text-fg-dim mb-5">
        <span className="text-[var(--accent)]">{index}</span>
        <span className="block h-px w-10 bg-[var(--border-strong)]" />
        <span>{kicker ?? "Section"}</span>
      </div>
      <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-gradient-soft max-w-3xl">
        {title}
      </h2>
    </div>
  );
}
