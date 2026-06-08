interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeader({ label, title, subtitle, centered = false }: SectionHeaderProps) {
  const align = centered ? "text-center" : "";
  return (
    <div className={`mb-12 ${align}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-sm leading-relaxed text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
