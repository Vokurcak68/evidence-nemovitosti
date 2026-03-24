export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarClock, CheckCircle2, ClipboardList, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatDate } from "@/lib/utils";
import type { Plot, Task } from "@/lib/types";

type TaskPreview = Pick<Task, "id" | "title" | "plot_id" | "status" | "deadline" | "created_at">;

export default async function DashboardPage() {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const in7Str = in7.toISOString().slice(0, 10);

  const [{ count: plotsCount }, { count: todoCount }, { count: doneCount }] = await Promise.all([
    supabase.from("plots").select("id", { count: "exact", head: true }),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "todo"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "done"),
  ]);

  const { data: upcomingTasks } = await supabase
    .from("tasks")
    .select("id,title,plot_id,status,deadline,created_at")
    .eq("status", "todo")
    .gte("deadline", todayStr)
    .lte("deadline", in7Str)
    .order("deadline", { ascending: true })
    .limit(8);

  const { data: recentTasks } = await supabase
    .from("tasks")
    .select("id,title,plot_id,status,deadline,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const allTaskRows = [...((upcomingTasks as TaskPreview[] | null) ?? []), ...((recentTasks as TaskPreview[] | null) ?? [])];
  const plotIds = [...new Set(allTaskRows.map((task) => task.plot_id))];

  let plotsById = new Map<string, string>();
  if (plotIds.length > 0) {
    const { data: plots } = await supabase.from("plots").select("id,name").in("id", plotIds);
    plotsById = new Map(((plots as Pick<Plot, "id" | "name">[] | null) ?? []).map((plot) => [plot.id, plot.name]));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-600">Počet pozemků</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-800">{plotsCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Úkoly k řešení</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">{todoCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Vyřešené úkoly</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{doneCount ?? 0}</p>
        </Card>
        <Card className="bg-emerald-50">
          <p className="text-sm text-emerald-900">Rychlé akce</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/pozemky/novy" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
              Nový pozemek
            </Link>
            <Link href="/ukoly" className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
              Přehled úkolů
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock size={18} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Blížící se termíny</h2>
          </div>

          {(upcomingTasks?.length ?? 0) === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nic akutního" description="V dalších 7 dnech nemáš žádný termín." />
          ) : (
            <div className="space-y-3">
              {(upcomingTasks as TaskPreview[]).map((task) => (
                <Link
                  key={task.id}
                  href={`/pozemky/${task.plot_id}`}
                  className="block rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition hover:bg-emerald-50"
                >
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-600">{plotsById.get(task.plot_id) ?? "Neznámý pozemek"}</p>
                  <p className="mt-1 text-xs text-emerald-800">Termín: {formatDate(task.deadline)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Nedávno přidané úkoly</h2>
          </div>

          {(recentTasks?.length ?? 0) === 0 ? (
            <EmptyState icon={MapPinned} title="Zatím bez úkolů" description="Jakmile přidáš první úkol, objeví se tady." />
          ) : (
            <div className="space-y-3">
              {(recentTasks as TaskPreview[]).map((task) => (
                <Link
                  key={task.id}
                  href={`/pozemky/${task.plot_id}`}
                  className="block rounded-xl border border-emerald-100 bg-white p-3 transition hover:bg-emerald-50/40"
                >
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-600">{plotsById.get(task.plot_id) ?? "Neznámý pozemek"}</p>
                  <p className="mt-1 text-xs text-slate-500">Přidáno: {formatDate(task.created_at)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
