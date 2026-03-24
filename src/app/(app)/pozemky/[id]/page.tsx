export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { PlotDetailClient } from "@/components/plot-detail-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatArea } from "@/lib/utils";
import type { Plot, PlotPhoto, Task, UserProfile } from "@/lib/types";
import { T } from "@/lib/tables";

async function deletePlotAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();
  const id = String(formData.get("id") ?? "");

  const { data: plot } = await supabase.from(T.plots).select("created_by").eq("id", id).maybeSingle<{ created_by: string | null }>();

  if (!plot) {
    throw new Error("Pozemek neexistuje.");
  }

  if (profile.role !== "admin" && plot.created_by !== user.id) {
    throw new Error("Na smazání nemáš oprávnění.");
  }

  const { error } = await supabase.from(T.plots).delete().eq("id", id);
  if (error) {
    throw new Error("Nepodařilo se smazat pozemek.");
  }

  redirect("/pozemky");
}

export default async function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: plot } = await supabase.from(T.plots).select("*").eq("id", id).maybeSingle<Plot>();
  if (!plot) {
    redirect("/pozemky");
  }

  const [{ data: photos }, { data: tasks }, { data: users }] = await Promise.all([
    supabase
      .from(T.plot_photos)
      .select("id,plot_id,url,caption,uploaded_by,created_at")
      .eq("plot_id", id)
      .order("created_at", { ascending: false }),
    supabase.from(T.tasks).select("*").eq("plot_id", id).order("created_at", { ascending: false }),
    supabase.from(T.user_profiles).select("*").order("full_name", { ascending: true }),
  ]);

  const canDelete = profile.role === "admin" || plot.created_by === user.id;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-900">{plot.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{plot.address || "Bez adresy"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/pozemky/${plot.id}/upravit`}>
              <Button variant="secondary">
                <Pencil size={16} className="mr-1" /> Upravit
              </Button>
            </Link>
            {canDelete ? (
              <form action={deletePlotAction}>
                <input type="hidden" name="id" value={plot.id} />
                <Button variant="danger" type="submit">
                  <Trash2 size={16} className="mr-1" /> Smazat
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Katastrální číslo</p>
            <p className="mt-1 font-semibold text-slate-900">{plot.cadastral_number || "—"}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">LV číslo</p>
            <p className="mt-1 font-semibold text-slate-900">{plot.lv_number || "—"}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Výměra</p>
            <p className="mt-1 font-semibold text-slate-900">{formatArea(plot.area_m2)}</p>
          </div>
        </div>

        {plot.notes ? (
          <div>
            <p className="text-sm font-semibold text-slate-700">Poznámky</p>
            <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{plot.notes}</p>
          </div>
        ) : null}

        {plot.gps_lat !== null && plot.gps_lng !== null ? (
          <a
            href={`https://maps.google.com/?q=${plot.gps_lat},${plot.gps_lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <MapPin size={16} /> Otevřít v Google Maps
          </a>
        ) : null}
      </Card>

      <PlotDetailClient
        plotId={plot.id}
        initialPhotos={(photos as PlotPhoto[] | null) ?? []}
        initialTasks={(tasks as Task[] | null) ?? []}
        users={(users as UserProfile[] | null) ?? []}
        currentUserId={user.id}
      />
    </div>
  );
}
