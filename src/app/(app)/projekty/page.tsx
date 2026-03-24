export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { T } from "@/lib/tables";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: projects } = await supabase.from(T.projects).select("*").order("name", { ascending: true });
  const list = (projects ?? []) as Project[];

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

      {list.length === 0 ? (
        <EmptyState title="Žádné projekty" description="Vytvořte první projekt." />
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <Link key={p.id} href={`/projekty/${p.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
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
