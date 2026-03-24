export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, Plus } from "lucide-react";
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
  const { data: recentActions } = await supabase
    .from(T.project_actions)
    .select("*, project:en_projects(id, name)")
    .order("action_date", { ascending: false })
    .limit(5);

  const list = (projects ?? []) as Project[];
  const recent = (recentActions ?? []) as Array<{
    id: string;
    project_id: string;
    action_date: string;
    description: string;
    person: string | null;
    project?: { id: string; name: string } | null;
  }>;

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

      {recent.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Clock className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-semibold text-emerald-800">Poslední úkony</h2>
          </div>

          <div className="space-y-2">
            {recent.map((action) => (
              <Link key={action.id} href={`/projekty/${action.project_id}?tab=actions`} className="block">
                <Card className="cursor-pointer p-3 transition-shadow hover:shadow-md active:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-medium text-emerald-700">{formatDate(action.action_date)}</span>
                      {action.person && <span className="truncate">{action.person}</span>}
                    </div>
                    <p className="line-clamp-1 text-sm text-slate-800">{action.description}</p>
                    <p className="text-xs text-slate-500">Projekt: {action.project?.name ?? "—"}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState title="Žádné projekty" description="Vytvořte první projekt." />
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
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
