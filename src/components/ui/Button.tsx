import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const base = "inline-flex items-center justify-content-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    `${base} justify-center rounded-full bg-[#0066FF] hover:bg-[#0052CC] px-6 py-3 text-sm text-white shadow-sm`,
  secondary:
    `${base} rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-[18px] py-[10px] text-sm font-medium text-slate-600 hover:text-slate-900`,
  small:
    `${base} rounded-lg bg-[#0066FF] hover:bg-[#0052CC] px-3 py-1.5 text-xs text-white`,
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
