"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { T } from "@/lib/tables";
import type { Project } from "@/lib/types";

type Props = {
  project?: Project;
  userId: string;
};

export function ProjectForm({ project, userId }: Props) {
  const supabase = useSupabase();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const values = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || null,
      current_up_state: (fd.get("current_up_state") as string) || null,
      target_up_state: (fd.get("target_up_state") as string) || null,
      min_parcel_area: (fd.get("min_parcel_area") as string) || null,
      restrictions: (fd.get("restrictions") as string) || null,
      purchase_price: (fd.get("purchase_price") as string) || null,
      purchase_date: (fd.get("purchase_date") as string) || null,
      notes: (fd.get("notes") as string) || null,
    };

    if (!values.name.trim()) {
      setError("Název projektu je povinný.");
      setSaving(false);
      return;
    }

    let result;
    if (project) {
      result = await supabase.from(T.projects).update({ ...values, updated_at: new Date().toISOString() }).eq("id", project.id);
    } else {
      result = await supabase.from(T.projects).insert({ ...values, created_by: userId }).select("id").single();
    }

    setSaving(false);

    if (result.error) {
      setError("Nepodařilo se uložit projekt.");
      return;
    }

    const id = project?.id ?? result.data?.id;
    router.push(`/projekty/${id}`);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4 p-1">
        <div className="grid gap-1">
          <label className="text-sm font-semibold text-slate-700">Název projektu *</label>
          <Input name="name" defaultValue={project?.name ?? ""} required placeholder="např. Vlkovec" />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-semibold text-slate-700">Záměr — stručný popis</label>
          <Textarea name="description" defaultValue={project?.description ?? ""} rows={2} placeholder="Změna ÚP na stavební pozemky..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Stávající stav ÚP</label>
            <Input name="current_up_state" defaultValue={project?.current_up_state ?? ""} placeholder="Zemědělská půda" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Cílový stav ÚP</label>
            <Input name="target_up_state" defaultValue={project?.target_up_state ?? ""} placeholder="Venkovské bydlení" />
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-semibold text-slate-700">Min. výměra stavební parcely / zastavitelnost</label>
          <Input name="min_parcel_area" defaultValue={project?.min_parcel_area ?? ""} placeholder="1000 m²" />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-semibold text-slate-700">Omezení</label>
          <Textarea name="restrictions" defaultValue={project?.restrictions ?? ""} rows={2} placeholder="V rámci obce není možnost..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Pořizovací cena</label>
            <Input name="purchase_price" defaultValue={project?.purchase_price ?? ""} placeholder="30 Kč/m²" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Datum pořízení</label>
            <Input name="purchase_date" type="date" defaultValue={project?.purchase_date ?? ""} />
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-semibold text-slate-700">Poznámky</label>
          <Textarea name="notes" defaultValue={project?.notes ?? ""} rows={2} />
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Ukládám…" : project ? "Uložit změny" : "Vytvořit projekt"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Zrušit
          </Button>
        </div>
      </form>
    </Card>
  );
}
