export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { PlotFormFields } from "@/components/plot-form-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toNullableNumber } from "@/lib/utils";
import type { Plot } from "@/lib/types";

async function updatePlot(id: string, formData: FormData) {
  "use server";

  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("plots")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      address: (formData.get("address") as string) || null,
      cadastral_number: (formData.get("cadastral_number") as string) || null,
      lv_number: (formData.get("lv_number") as string) || null,
      area_m2: toNullableNumber(formData.get("area_m2")),
      gps_lat: toNullableNumber(formData.get("gps_lat")),
      gps_lng: toNullableNumber(formData.get("gps_lng")),
      notes: (formData.get("notes") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error("Nepodařilo se uložit změny pozemku.");
  }

  redirect(`/pozemky/${id}`);
}

export default async function UpravitPozemekPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: plot } = await supabase.from("plots").select("*").eq("id", id).maybeSingle<Plot>();

  if (!plot) {
    redirect("/pozemky");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-emerald-900">Upravit pozemek</h1>
      <Card>
        <form action={updatePlot.bind(null, id)} className="space-y-5">
          <PlotFormFields values={plot} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit">Uložit změny</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
