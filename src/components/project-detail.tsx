"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileText, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { T, BUCKET_ATTACHMENTS } from "@/lib/tables";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectPlot, ProjectAction, ProjectAttachment, UserProfile } from "@/lib/types";

type Tab = "info" | "plots" | "actions" | "files";

type Props = {
  project: Project;
  plots: ProjectPlot[];
  actions: ProjectAction[];
  attachments: ProjectAttachment[];
  users: UserProfile[];
  userId: string;
};

export function ProjectDetail({ project, plots, actions, attachments, users, userId }: Props) {
  const [tab, setTab] = useState<Tab>("info");
  const supabase = useSupabase();
  const router = useRouter();

  const refresh = useCallback(() => router.refresh(), [router]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "info", label: "Info" },
    { key: "plots", label: "Pozemky", count: plots.length },
    { key: "actions", label: "Úkony", count: actions.length },
    { key: "files", label: "Přílohy", count: attachments.length },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          {project.description && <p className="mt-1 text-sm text-slate-500">{project.description}</p>}
        </div>
        <Link href={`/projekty/${project.id}/upravit`}>
          <Button variant="secondary" size="sm">
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Upravit
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1 text-xs text-slate-400">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "info" && <InfoTab project={project} />}
      {tab === "plots" && <PlotsTab plots={plots} projectId={project.id} supabase={supabase} refresh={refresh} />}
      {tab === "actions" && (
        <ActionsTab actions={actions} users={users} projectId={project.id} userId={userId} supabase={supabase} refresh={refresh} />
      )}
      {tab === "files" && (
        <FilesTab attachments={attachments} projectId={project.id} userId={userId} supabase={supabase} refresh={refresh} />
      )}
    </div>
  );
}

/* ── Info Tab ─── */
function InfoTab({ project }: { project: Project }) {
  const fields = [
    { label: "Stávající stav ÚP", value: project.current_up_state },
    { label: "Cílový stav ÚP", value: project.target_up_state },
    { label: "Min. výměra / zastavitelnost", value: project.min_parcel_area },
    { label: "Omezení", value: project.restrictions },
    { label: "Pořizovací cena", value: project.purchase_price },
    { label: "Datum pořízení", value: project.purchase_date ? formatDate(project.purchase_date) : null },
    { label: "Poznámky", value: project.notes },
  ];

  return (
    <Card className="divide-y divide-slate-100">
      {fields.map((f) => (
        <div key={f.label} className="flex flex-col gap-0.5 px-4 py-3">
          <span className="text-xs font-medium text-slate-400">{f.label}</span>
          <span className="text-sm text-slate-800">{f.value || "—"}</span>
        </div>
      ))}
    </Card>
  );
}

/* ── Plots Tab ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlotsTab({ plots, projectId, supabase, refresh }: { plots: ProjectPlot[]; projectId: string; supabase: any; refresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [parcel, setParcel] = useState("");
  const [area, setArea] = useState("");

  async function addPlot() {
    if (!parcel.trim()) return;
    await supabase.from(T.project_plots).insert({
      project_id: projectId,
      parcel_number: parcel.trim(),
      area_m2: area ? Number(area) : null,
    });
    setParcel("");
    setArea("");
    setAdding(false);
    refresh();
  }

  async function deletePlot(id: string) {
    await supabase.from(T.project_plots).delete().eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-3">
      {plots.length === 0 && !adding && (
        <Card className="p-6 text-center text-sm text-slate-500">Žádné pozemky.</Card>
      )}
      {plots.map((p) => (
        <Card key={p.id} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-slate-800">Parcela {p.parcel_number}</p>
              {p.area_m2 && <p className="text-xs text-slate-500">{p.area_m2} m²</p>}
            </div>
          </div>
          <button onClick={() => deletePlot(p.id)} className="text-slate-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </Card>
      ))}

      {adding ? (
        <Card className="space-y-2 p-3">
          <Input value={parcel} onChange={(e) => setParcel(e.target.value)} placeholder="Číslo parcely" />
          <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Výměra m² (volitelné)" type="number" />
          <div className="flex gap-2">
            <Button onClick={addPlot} size="sm">Přidat</Button>
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Zrušit</Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className="w-full">
          <Plus className="mr-1.5 h-4 w-4" />
          Přidat pozemek
        </Button>
      )}
    </div>
  );
}

/* ── Actions Tab ─── */
function ActionsTab({
  actions, users, projectId, userId, supabase, refresh,
}: {
  actions: ProjectAction[]; users: UserProfile[]; projectId: string; userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any; refresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [person, setPerson] = useState("");
  const [contact, setContact] = useState("");

  async function addAction() {
    if (!desc.trim()) return;
    await supabase.from(T.project_actions).insert({
      project_id: projectId,
      action_date: date,
      description: desc.trim(),
      person: person.trim() || null,
      contact: contact.trim() || null,
      created_by: userId,
    });
    setDesc("");
    setPerson("");
    setContact("");
    setAdding(false);
    refresh();
  }

  async function deleteAction(id: string) {
    await supabase.from(T.project_actions).delete().eq("id", id);
    refresh();
  }

  const getUserName = (id: string | null) => users.find((u) => u.id === id)?.full_name ?? "—";

  return (
    <div className="space-y-3">
      {actions.length === 0 && !adding && (
        <Card className="p-6 text-center text-sm text-slate-500">Žádné úkony.</Card>
      )}
      {actions.map((a) => (
        <Card key={a.id} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-emerald-700">{formatDate(a.action_date)}</span>
                {a.person && <span>· {a.person}</span>}
                {a.created_by && <span>· {getUserName(a.created_by)}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-800">{a.description}</p>
              {a.contact && <p className="mt-0.5 text-xs text-slate-500">Kontakt: {a.contact}</p>}
            </div>
            <button onClick={() => deleteAction(a.id)} className="shrink-0 text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </Card>
      ))}

      {adding ? (
        <Card className="space-y-2 p-3">
          <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Popis úkonu" rows={2} />
          <div className="grid grid-cols-2 gap-2">
            <Input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Osoba" />
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Kontakt" />
          </div>
          <div className="flex gap-2">
            <Button onClick={addAction} size="sm">Přidat</Button>
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Zrušit</Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className="w-full">
          <Plus className="mr-1.5 h-4 w-4" />
          Přidat úkon
        </Button>
      )}
    </div>
  );
}

/* ── Files Tab ─── */
function FilesTab({
  attachments, projectId, userId, supabase, refresh,
}: {
  attachments: ProjectAttachment[]; projectId: string; userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any; refresh: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const path = `${projectId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_ATTACHMENTS).upload(path, file);
      if (uploadError) continue;

      const { data: urlData } = supabase.storage.from(BUCKET_ATTACHMENTS).getPublicUrl(path);

      await supabase.from(T.project_attachments).insert({
        project_id: projectId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type || null,
        uploaded_by: userId,
      });
    }

    setUploading(false);
    refresh();
    e.target.value = "";
  }

  async function deleteAttachment(att: ProjectAttachment) {
    // Extract storage path from URL
    const urlParts = att.file_url.split(`${BUCKET_ATTACHMENTS}/`);
    if (urlParts[1]) {
      await supabase.storage.from(BUCKET_ATTACHMENTS).remove([urlParts[1]]);
    }
    await supabase.from(T.project_attachments).delete().eq("id", att.id);
    refresh();
  }

  return (
    <div className="space-y-3">
      {attachments.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-500">Žádné přílohy.</Card>
      )}
      {attachments.map((a) => (
        <Card key={a.id} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-blue-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{a.file_name}</p>
              <p className="text-xs text-slate-400">{formatDate(a.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
              <Download className="h-4 w-4" />
            </a>
            <button onClick={() => deleteAttachment(a)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </Card>
      ))}

      <label className="block">
        <Button variant="secondary" className="w-full" disabled={uploading} asChild>
          <span>
            <Plus className="mr-1.5 h-4 w-4" />
            {uploading ? "Nahrávám…" : "Nahrát přílohu"}
          </span>
        </Button>
        <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}
