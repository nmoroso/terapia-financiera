import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const cls =
    variant === "primary"
      ? `btn-primary ${className}`
      : variant === "secondary"
      ? `btn-secondary ${className}`
      : `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  const style =
    variant === "small"
      ? { backgroundColor: "var(--c-primary)" }
      : undefined;

  return (
    <button className={cls} style={style} {...props}>
      {children}
    </button>
  );
}
