"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListChecks, Search } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { TaskStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { Task, UserProfile } from "@/lib/types";

type TaskRow = Task & { plotName: string };

export function TasksList({
  initialTasks,
  users,
}: {
  initialTasks: TaskRow[];
  users: UserProfile[];
}) {
  const supabase = useSupabase();
  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "done">("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [query, setQuery] = useState("");

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tasks
      .filter((task) => (statusFilter === "all" ? true : task.status === statusFilter))
      .filter((task) => (assignedFilter === "all" ? true : task.assigned_to === assignedFilter))
      .filter((task) => {
        if (!q) return true;
        return `${task.title} ${task.plotName} ${task.description ?? ""}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
  }, [tasks, statusFilter, assignedFilter, query]);

  async function toggleStatus(task: TaskRow) {
    const nextStatus = task.status === "todo" ? "done" : "todo";
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .select("*")
      .single<Task>();

    if (error || !data) {
      return;
    }

    setTasks((prev) => prev.map((row) => (row.id === task.id ? { ...row, ...data } : row)));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Hledat úkol" />
        </div>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "todo" | "done")}>
          <option value="all">Všechny stavy</option>
          <option value="todo">K řešení</option>
          <option value="done">Vyřešené</option>
        </Select>

        <Select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
          <option value="all">Všichni uživatelé</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="Žádné úkoly" description="Zkus změnit filtry." />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                  <p className="text-sm text-slate-600">Pozemek: {task.plotName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Termín: {formatDate(task.deadline)} • Přiřazeno: {task.assigned_to ? userById.get(task.assigned_to)?.full_name ?? "—" : "—"}
                  </p>
                </div>

                <TaskStatusBadge status={task.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => toggleStatus(task)}>
                  {task.status === "todo" ? "Označit jako vyřešené" : "Vrátit do řešení"}
                </Button>
                <Link href={`/pozemky/${task.plot_id}`}>
                  <Button variant="ghost">Detail pozemku</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
