import type { ReactNode } from "react";

type BadgeVariant = "default" | "active" | "warning" | "success";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600",
  active: "rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700",
  warning: "rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700",
  success: "rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return <span className={variants[variant]}>{children}</span>;
}
