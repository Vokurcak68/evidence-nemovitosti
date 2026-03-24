export const dynamic = "force-dynamic";

import Link from "next/link";
import { FolderOpen, FileText, Activity, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { T } from "@/lib/tables";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectAction } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [projectsRes, actionsRes] = await Promise.all([
    supabase.from(T.projects).select("*").order("updated_at", { ascending: false }),
    supabase
      .from(T.project_actions)
      .select("*, en_projects(name)")
      .order("action_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const projects = (projectsRes.data ?? []) as Project[];
  const recentActions = (actionsRes.data ?? []) as (ProjectAction & { en_projects: { name: string } | null })[];

  return (
    <div className="space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Přehled</h1>
        <Link href="/projekty/novy">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Nový projekt
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-emerald-100 p-2.5">
            <FolderOpen className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-500">Projektů</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-blue-100 p-2.5">
            <Activity className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{recentActions.length}</p>
            <p className="text-xs text-slate-500">Posledních úkonů</p>
          </div>
        </Card>
      </div>

      {/* Recent projects */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Projekty</h2>
        {projects.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-500">
            Zatím žádné projekty. Vytvořte první!
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <Link key={p.id} href={`/projekty/${p.id}`} className="block">
                <Card className="flex cursor-pointer items-center justify-between p-4 transition-shadow hover:shadow-md active:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    {p.description && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{p.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(p.updated_at)}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent actions */}
      {recentActions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Poslední úkony</h2>
          <div className="space-y-2">
            {recentActions.map((a) => (
              <Link key={a.id} href={`/projekty/${a.project_id}?tab=actions`} className="block">
                <Card className="cursor-pointer p-3 transition-shadow hover:shadow-md active:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-emerald-700">{a.en_projects?.name}</p>
                      <p className="mt-0.5 text-sm text-slate-700">{a.description}</p>
                      {a.person && <p className="mt-0.5 text-xs text-slate-500">{a.person}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(a.action_date)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
