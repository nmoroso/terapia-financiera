interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({ label, title, subtitle, align = "center" }: SectionHeaderProps) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const mx = align === "center" ? "mx-auto" : "";

  return (
    <div className={`mb-12 max-w-2xl ${mx} ${textAlign}`}>
      <span className="section-label">{label}</span>
      <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl leading-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-slate-600 md:text-base" style={{ lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
