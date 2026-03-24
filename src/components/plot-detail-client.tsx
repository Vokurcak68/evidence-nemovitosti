"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Plus, Save, Trash2 } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { PlotPhotoGallery } from "@/components/plot-photo-gallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TaskStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { PlotPhoto, Task, UserProfile } from "@/lib/types";

type TaskFormState = {
  id: string | null;
  title: string;
  description: string;
  deadline: string;
  assigned_to: string;
};

const emptyTaskForm: TaskFormState = {
  id: null,
  title: "",
  description: "",
  deadline: "",
  assigned_to: "",
};

export function PlotDetailClient({
  plotId,
  initialPhotos,
  initialTasks,
  users,
  currentUserId,
}: {
  plotId: string;
  initialPhotos: PlotPhoto[];
  initialTasks: Task[];
  users: UserProfile[];
  currentUserId: string;
}) {
  const supabase = useSupabase();
  const [photos, setPhotos] = useState<PlotPhoto[]>(initialPhotos);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm);
  const [taskSaving, setTaskSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  async function handleUploadPhoto() {
    if (!selectedFile) return;

    setError(null);
    setUploadingPhoto(true);
    try {
      const filePath = `${plotId}/${Date.now()}-${selectedFile.name.replaceAll(" ", "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("plot-photos")
        .upload(filePath, selectedFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("plot-photos").getPublicUrl(filePath);
      const { data, error: insertError } = await supabase
        .from("plot_photos")
        .insert({
          plot_id: plotId,
          url: publicData.publicUrl,
          caption: caption.trim() || null,
          uploaded_by: currentUserId,
        })
        .select("id,plot_id,url,caption,uploaded_by,created_at")
        .single<PlotPhoto>();

      if (insertError || !data) throw insertError ?? new Error("Nepodařilo se uložit fotku.");

      setPhotos((prev) => [data, ...prev]);
      setSelectedFile(null);
      setCaption("");
    } catch {
      setError("Nahrání fotky selhalo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("plot_photos").delete().eq("id", photoId);
    if (deleteError) {
      setError("Fotku se nepodařilo smazat.");
      return;
    }
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  }

  function startEditTask(task: Task) {
    setTaskForm({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      deadline: task.deadline ?? "",
      assigned_to: task.assigned_to ?? "",
    });
  }

  function resetTaskForm() {
    setTaskForm(emptyTaskForm);
  }

  async function saveTask() {
    if (!taskForm.title.trim()) {
      setError("Název úkolu je povinný.");
      return;
    }

    setError(null);
    setTaskSaving(true);

    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || null,
      deadline: taskForm.deadline || null,
      assigned_to: taskForm.assigned_to || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (taskForm.id) {
        const { data, error: updateError } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", taskForm.id)
          .select("*")
          .single<Task>();

        if (updateError || !data) throw updateError ?? new Error("Nepodařilo se uložit změny úkolu.");

        setTasks((prev) => prev.map((task) => (task.id === data.id ? data : task)));
      } else {
        const { data, error: insertError } = await supabase
          .from("tasks")
          .insert({
            ...payload,
            plot_id: plotId,
            status: "todo",
            created_by: currentUserId,
            completed_at: null,
            reminder_date: null,
            reminder_sent: false,
          })
          .select("*")
          .single<Task>();

        if (insertError || !data) throw insertError ?? new Error("Nepodařilo se vytvořit úkol.");

        setTasks((prev) => [data, ...prev]);
      }

      resetTaskForm();
    } catch {
      setError("Uložení úkolu selhalo.");
    } finally {
      setTaskSaving(false);
    }
  }

  async function toggleTaskStatus(task: Task) {
    const done = task.status === "todo";
    const { data, error: updateError } = await supabase
      .from("tasks")
      .update({
        status: done ? "done" : "todo",
        completed_at: done ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .select("*")
      .single<Task>();

    if (updateError || !data) {
      setError("Nepodařilo se změnit stav úkolu.");
      return;
    }

    setTasks((prev) => prev.map((row) => (row.id === data.id ? data : row)));
  }

  async function deleteTask(taskId: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId);
    if (deleteError) {
      setError("Úkol se nepodařilo smazat.");
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (taskForm.id === taskId) {
      resetTaskForm();
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Fotogalerie</h2>

        <div className="grid gap-3 rounded-xl bg-emerald-50 p-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Fotka
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="h-auto py-2"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Popis fotky
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Např. severní hranice" />
          </label>
          <Button
            onClick={handleUploadPhoto}
            disabled={!selectedFile || uploadingPhoto}
            className="md:col-span-2 md:justify-self-end"
          >
            {uploadingPhoto ? "Nahrávám…" : "Nahrát fotku"}
          </Button>
        </div>

        <PlotPhotoGallery photos={photos} />

        {photos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Správa fotek</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-3 py-2">
                  <span className="truncate text-sm text-slate-600">{photo.caption || "Bez popisku"}</span>
                  <Button variant="ghost" onClick={() => handleDeletePhoto(photo.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Úkoly k pozemku</h2>
          <Button variant="secondary" onClick={resetTaskForm}>
            <Plus size={16} className="mr-1" /> Nový úkol
          </Button>
        </div>

        <div className="grid gap-3 rounded-xl bg-emerald-50 p-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Název úkolu
            <Input value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Popis
            <Textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
              className="min-h-20"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Termín
              <Input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Přiřazeno
              <Select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm((p) => ({ ...p, assigned_to: e.target.value }))}
              >
                <option value="">Nepřiřazeno</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {taskForm.id ? (
              <Button variant="ghost" onClick={resetTaskForm}>
                Zrušit úpravu
              </Button>
            ) : null}
            <Button onClick={saveTask} disabled={taskSaving}>
              <Save size={16} className="mr-1" />
              {taskForm.id ? "Uložit změny" : "Přidat úkol"}
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <EmptyState icon={Camera} title="Bez úkolů" description="Přidej první úkol k tomuto pozemku." />
        ) : (
          <div className="space-y-3">
            {tasks
              .slice()
              .sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline.localeCompare(b.deadline);
              })
              .map((task) => (
                <div key={task.id} className="rounded-xl border border-emerald-100 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      {task.description ? <p className="mt-1 text-sm text-slate-600">{task.description}</p> : null}
                      <p className="mt-1 text-xs text-slate-500">
                        Termín: {formatDate(task.deadline)} • Přiřazeno: {task.assigned_to ? userById.get(task.assigned_to)?.full_name ?? "—" : "—"}
                      </p>
                    </div>
                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => toggleTaskStatus(task)}>
                      {task.status === "todo" ? "Označit jako vyřešené" : "Vrátit do řešení"}
                    </Button>
                    <Button variant="ghost" onClick={() => startEditTask(task)}>
                      Upravit
                    </Button>
                    <Button variant="danger" onClick={() => deleteTask(task.id)}>
                      Smazat
                    </Button>
                    <Link href={`/ukoly`} className="ml-auto">
                      <Button variant="ghost">Všechny úkoly</Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
