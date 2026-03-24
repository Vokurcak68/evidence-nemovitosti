export function LoadingSpinner({ label = "Načítám…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
