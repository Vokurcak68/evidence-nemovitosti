"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PlotItem = {
  id: string;
  name: string;
  address: string | null;
  cadastral_number: string | null;
  photoUrl: string | null;
};

export function PlotsList({ plots }: { plots: PlotItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return plots;
    }

    return plots.filter((plot) => {
      const haystack = `${plot.name} ${plot.address ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [plots, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            placeholder="Hledat podle názvu nebo adresy"
          />
        </div>

        <Link href="/pozemky/novy" className="sm:shrink-0">
          <Button className="w-full sm:w-auto">Přidat pozemek</Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MapPinned} title="Žádné pozemky" description="Zkus upravit filtr nebo přidej nový pozemek." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((plot) => (
            <Link key={plot.id} href={`/pozemky/${plot.id}`}>
              <Card className="h-full overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="aspect-[4/3] w-full bg-emerald-50">
                  {plot.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={plot.photoUrl} alt={plot.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-emerald-700">Bez fotky</div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="text-base font-semibold text-slate-900">{plot.name}</h3>
                  <p className="text-sm text-slate-600">{plot.address || "Bez adresy"}</p>
                  <p className="text-xs text-slate-500">Katastrální číslo: {plot.cadastral_number || "—"}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
