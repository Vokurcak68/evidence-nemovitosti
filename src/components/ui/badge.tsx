import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
      )}
    >
      {status === "done" ? "Vyřešeno" : "K řešení"}
    </span>
  );
}

export function RoleBadge({ role }: { role: "admin" | "user" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700",
      )}
    >
      {role === "admin" ? "Admin" : "Uživatel"}
    </span>
  );
}
