import { redirect } from "next/navigation";
import { PlotFormFields } from "@/components/plot-form-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toNullableNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function createPlot(formData: FormData) {
  "use server";

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("plots")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      address: (formData.get("address") as string) || null,
      cadastral_number: (formData.get("cadastral_number") as string) || null,
      lv_number: (formData.get("lv_number") as string) || null,
      area_m2: toNullableNumber(formData.get("area_m2")),
      gps_lat: toNullableNumber(formData.get("gps_lat")),
      gps_lng: toNullableNumber(formData.get("gps_lng")),
      notes: (formData.get("notes") as string) || null,
      created_by: user.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error("Nepodařilo se vytvořit pozemek.");
  }

  redirect(`/pozemky/${data.id}`);
}

export default async function NovyPozemekPage() {
  await requireUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-emerald-900">Přidat pozemek</h1>
      <Card>
        <form action={createPlot} className="space-y-5">
          <PlotFormFields />
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit">Uložit pozemek</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
