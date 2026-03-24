"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = normalize(query.trim());
    return projects.filter((p) => {
      const haystack = normalize(
        [
          p.name,
          p.description,
          p.current_up_state,
          p.target_up_state,
          p.min_parcel_area,
          p.restrictions,
          p.purchase_price,
          p.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );
      return haystack.includes(q);
    });
  }, [projects, query]);

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Projekty</h1>
        <Link href="/projekty/novy">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Nový
          </Button>
        </Link>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat projekt…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 active:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        query ? (
          <Card className="p-6 text-center text-sm text-slate-500">
            Žádné výsledky pro &ldquo;{query}&rdquo;
          </Card>
        ) : (
          <EmptyState title="Žádné projekty" description="Vytvořte první projekt." />
        )
      ) : (
        <div className="space-y-2">
          {query && (
            <p className="px-1 text-xs text-slate-400">
              {filtered.length} z {projects.length} projektů
            </p>
          )}
          {filtered.map((p) => (
            <Link key={p.id} href={`/projekty/${p.id}`} className="block">
              <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md active:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    {p.description && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{p.description}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-slate-400">
                      {p.current_up_state && <span>ÚP: {p.current_up_state}</span>}
                      {p.target_up_state && <span>→ {p.target_up_state}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(p.updated_at)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
