"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, FileImage, FileText, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
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
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "info";
  const [tab, setTab] = useState<Tab>(initialTab);
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
      <div className="flex gap-0.5 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs sm:text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-0.5 text-[10px] sm:text-xs text-slate-400">({t.count})</span>
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
          <button type="button" onClick={() => deletePlot(p.id)} className="rounded-lg p-2.5 text-slate-400 active:bg-slate-100 hover:text-red-500">
            <Trash2 className="h-5 w-5" />
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
            <button type="button" onClick={() => deleteAction(a.id)} className="shrink-0 rounded-lg p-2.5 text-slate-400 active:bg-slate-100 hover:text-red-500">
              <Trash2 className="h-5 w-5" />
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
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

  function resolveStoragePath(fileUrl: string) {
    if (!fileUrl) return "";

    if (!fileUrl.startsWith("http")) {
      return fileUrl;
    }

    const [, pathWithQuery = ""] = fileUrl.split(`${BUCKET_ATTACHMENTS}/`);
    return decodeURIComponent(pathWithQuery.split("?")[0] || "");
  }

  function isImageAttachment(fileName: string, fileType?: string | null) {
    const lowerName = fileName.toLowerCase();
    const lowerType = (fileType || "").toLowerCase();
    return ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(lowerType)
      || /\.(jpg|jpeg|png|gif|webp)$/.test(lowerName);
  }

  function formatFileSize(bytes?: number | null) {
    if (!bytes || Number.isNaN(bytes)) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileVisual(fileName: string, fileType?: string | null) {
    const lowerName = fileName.toLowerCase();
    const lowerType = (fileType || "").toLowerCase();

    if (isImageAttachment(fileName, fileType)) {
      return { Icon: FileImage, color: "text-blue-600" };
    }

    if (lowerType.includes("pdf") || lowerName.endsWith(".pdf")) {
      return { Icon: FileText, color: "text-red-600" };
    }

    if (
      lowerType.includes("word")
      || /\.(doc|docx|odt|rtf)$/.test(lowerName)
    ) {
      return { Icon: FileText, color: "text-purple-600" };
    }

    if (
      lowerType.includes("sheet")
      || /\.(xls|xlsx|csv|ods)$/.test(lowerName)
    ) {
      return { Icon: FileText, color: "text-emerald-600" };
    }

    return { Icon: FileText, color: "text-slate-500" };
  }

  async function getSignedUrl(path: string, options?: { width?: number; height?: number }) {
    const { data, error } = await supabase.storage.from(BUCKET_ATTACHMENTS).createSignedUrl(path, 3600, options
      ? { transform: { width: options.width, height: options.height } }
      : undefined);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadThumbnails() {
      const imageAttachments = attachments.filter((a) => isImageAttachment(a.file_name, a.file_type));
      if (imageAttachments.length === 0) {
        setThumbnailUrls({});
        return;
      }

      const thumbEntries = await Promise.all(
        imageAttachments.map(async (a) => {
          const path = resolveStoragePath(a.file_url);
          if (!path) return null;

          const signedUrl = await getSignedUrl(path, { width: 80, height: 80 });
          if (!signedUrl) return null;

          return [a.id, signedUrl] as const;
        }),
      );

      if (cancelled) return;

      const nextThumbs: Record<string, string> = {};
      for (const entry of thumbEntries) {
        if (!entry) continue;
        nextThumbs[entry[0]] = entry[1];
      }
      setThumbnailUrls(nextThumbs);
    }

    loadThumbnails();

    return () => {
      cancelled = true;
    };
  }, [attachments]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const [index, file] of Array.from(files).entries()) {
        const path = `${projectId}/${Date.now()}_${index}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_ATTACHMENTS).upload(path, file);
        if (uploadError) continue;

        await supabase.from(T.project_attachments).insert({
          project_id: projectId,
          file_name: file.name,
          file_url: path,
          file_type: file.type || null,
          file_size: file.size || null,
          uploaded_by: userId,
        });
      }
    } finally {
      setUploading(false);
      refresh();
      e.target.value = "";
    }
  }

  async function openAttachment(att: ProjectAttachment) {
    const path = resolveStoragePath(att.file_url);
    if (!path) return;

    // Open window immediately (sync with user click) to avoid mobile popup blocker
    const win = window.open("about:blank", "_blank");
    const signedUrl = await getSignedUrl(path);
    if (!signedUrl || !win) return;
    win.location.href = signedUrl;
  }

  async function downloadAttachment(att: ProjectAttachment) {
    const path = resolveStoragePath(att.file_url);
    if (!path) return;

    const signedUrl = await getSignedUrl(path);
    if (!signedUrl) return;

    // Use anchor click for download (works on mobile)
    const a = document.createElement("a");
    a.href = signedUrl;
    a.download = att.file_name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function deleteAttachment(att: ProjectAttachment) {
    const path = resolveStoragePath(att.file_url);
    if (path) {
      await supabase.storage.from(BUCKET_ATTACHMENTS).remove([path]);
    }

    await supabase.from(T.project_attachments).delete().eq("id", att.id);
    refresh();
  }

  return (
    <div className="space-y-3">
      {attachments.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-500">Žádné přílohy.</Card>
      )}

      {attachments.map((a) => {
        const { Icon, color } = getFileVisual(a.file_name, a.file_type);
        const fileSize = formatFileSize(a.file_size);
        const isImage = isImageAttachment(a.file_name, a.file_type);

        return (
          <Card key={a.id} className="flex items-center justify-between gap-3 p-3">
            <div className="flex min-w-0 items-center gap-3">
              {isImage && thumbnailUrls[a.id] ? (
                <img
                  src={thumbnailUrls[a.id]}
                  alt={a.file_name}
                  className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
                />
              ) : (
                <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{a.file_name}</p>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                  <span>{formatDate(a.created_at)}</span>
                  {fileSize && <span>· {fileSize}</span>}
                  {a.category && <span>· Kategorie: {a.category}</span>}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0">
              <button
                type="button"
                onClick={() => openAttachment(a)}
                className="rounded-lg p-2.5 text-slate-500 active:bg-slate-100 hover:bg-slate-100 hover:text-blue-600"
                title="Zobrazit"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => downloadAttachment(a)}
                className="rounded-lg p-2.5 text-slate-500 active:bg-slate-100 hover:bg-slate-100 hover:text-blue-600"
                title="Stáhnout"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => deleteAttachment(a)}
                className="rounded-lg p-2.5 text-slate-500 active:bg-slate-100 hover:bg-slate-100 hover:text-red-500"
                title="Smazat"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </Card>
        );
      })}

      <label className="block cursor-pointer">
        <span className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-50">
          <Plus className="mr-1.5 h-4 w-4" />
          {uploading ? "Nahrávám…" : "Nahrát přílohu"}
        </span>
        <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}
