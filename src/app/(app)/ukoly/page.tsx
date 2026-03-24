import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Card } from "@/components/ui/card";
import type { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { T } from "@/lib/tables";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  assigned_to?: string;
  q?: string;
  deadline_to?: string;
};

type TaskRow = Pick<Task, "id" | "plot_id" | "title" | "status" | "deadline" | "assigned_to" | "created_at"> & {
  plot_name: string | null;
};

async function getTasks(filters: {
  status: string;
  assigned_to: string;
  q: string;
  deadline_to: string;
}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from(T.tasks)
    .select("id, plot_id, title, status, deadline, assigned_to, created_at, en_plots(name)")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.assigned_to) query = query.eq("assigned_to", filters.assigned_to);
  if (filters.deadline_to) query = query.lte("deadline", filters.deadline_to);
  if (filters.q.trim()) query = query.ilike("title", `%${filters.q}%`);

  const { data } = await query;

  const mapped: TaskRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    plot_id: row.plot_id,
    title: row.title,
    status: row.status,
    deadline: row.deadline,
    assigned_to: row.assigned_to,
    created_at: row.created_at,
    plot_name: row.en_plots?.name ?? null,
  }));

  return mapped;
}

async function getUsers() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from(T.user_profiles)
    .select("id, full_name, email")
    .order("full_name", { ascending: true });

  return (data ?? []) as { id: string; full_name: string; email: string }[];
}

export default async function TasksPage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParams> }>) {
  const sp = await searchParams;
  const filters = {
    status: sp.status ?? "",
    assigned_to: sp.assigned_to ?? "",
    q: sp.q ?? "",
    deadline_to: sp.deadline_to ?? "",
  };

  const [tasks, users] = await Promise.all([getTasks(filters), getUsers()]);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-extrabold text-emerald-900">Úkoly</h2>
        <p className="text-sm text-slate-600">Seznam všech úkolů napříč pozemky.</p>

        <form className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Hledat</span>
              <input
                name="q"
                placeholder="Název úkolu"
                defaultValue={filters.q}
                className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Stav</span>
              <select
                name="status"
                defaultValue={filters.status}
                className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
              >
                <option value="">Vše</option>
                <option value="todo">To-do</option>
                <option value="done">Hotovo</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Přiřazený</span>
              <select
                name="assigned_to"
                defaultValue={filters.assigned_to}
                className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
              >
                <option value="">Všichni</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Deadline do</span>
              <input
                name="deadline_to"
                type="date"
                defaultValue={filters.deadline_to}
                className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-base font-semibold text-white"
          >
            Filtrovat
          </button>
        </form>
      </Card>

      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/60 p-6 text-center">
          <div className="text-base font-extrabold text-emerald-900">Žádné úkoly</div>
          <div className="mt-1 text-sm text-slate-600">Zkus upravit filtry nebo přidej úkol u konkrétního pozemku.</div>
          <div className="mt-4 flex justify-center">
            <Link href="/pozemky" className="rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">
              Pozemky
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/pozemky/${t.plot_id}`}
              className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-emerald-900">{t.title}</div>
                  <div className="mt-1 text-sm text-slate-700">Pozemek: {t.plot_name ?? "—"}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${t.status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {t.status === "done" ? "Hotovo" : "To-do"}
                  </span>
                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    {t.deadline ? formatDate(t.deadline) : "—"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
