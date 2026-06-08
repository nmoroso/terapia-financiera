interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({ label, title, subtitle, align = "center" }: SectionHeaderProps) {
  const center = align === "center";
  return (
    <div className={`mb-16 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <span className="inline-block text-[11px] font-bold tracking-[0.14em] uppercase text-[#0066FF] mb-3">
        {label}
      </span>
      <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-[2.6rem] leading-[1.15] mb-5">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
