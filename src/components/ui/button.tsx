import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  children?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300 disabled:bg-emerald-300",
  secondary: "bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-50 focus-visible:ring-emerald-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 disabled:bg-red-300",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
};

const sizes: Record<Size, string> = {
  sm: "min-h-8 px-3 py-1 text-xs",
  md: "min-h-11 px-4 py-2 text-sm",
};

export function Button({ className, variant = "primary", size = "md", asChild, type = "button", children, ...props }: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center rounded-xl font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2",
    variants[variant],
    sizes[size],
    className,
  );

  if (asChild) {
    return <span className={cls}>{children}</span>;
  }

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}
