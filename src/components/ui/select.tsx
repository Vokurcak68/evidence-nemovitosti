import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-emerald-300",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
