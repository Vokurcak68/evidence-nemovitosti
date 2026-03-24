import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
      {Icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-base font-semibold text-emerald-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-emerald-800/80">{description}</p> : null}
    </div>
  );
}
