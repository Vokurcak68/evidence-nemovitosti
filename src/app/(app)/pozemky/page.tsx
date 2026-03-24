export const dynamic = "force-dynamic";

import { PlotsList } from "@/components/plots-list";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Plot, PlotPhoto } from "@/lib/types";
import { T } from "@/lib/tables";

export default async function PozemkyPage() {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: plots } = await supabase.from(T.plots).select("*").order("created_at", { ascending: false });
  const typedPlots = (plots as Plot[] | null) ?? [];

  const plotIds = typedPlots.map((p) => p.id);
  let firstPhotoByPlot = new Map<string, string>();

  if (plotIds.length > 0) {
    const { data: photos } = await supabase
      .from(T.plot_photos)
      .select("id,plot_id,url,caption,uploaded_by,created_at")
      .in("plot_id", plotIds)
      .order("created_at", { ascending: true });

    for (const photo of ((photos as PlotPhoto[] | null) ?? [])) {
      if (!firstPhotoByPlot.has(photo.plot_id)) {
        firstPhotoByPlot.set(photo.plot_id, photo.url);
      }
    }
  }

  const items = typedPlots.map((plot) => ({
    id: plot.id,
    name: plot.name,
    address: plot.address,
    cadastral_number: plot.cadastral_number,
    photoUrl: firstPhotoByPlot.get(plot.id) ?? null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-emerald-900">Pozemky</h1>
      <PlotsList plots={items} />
    </div>
  );
}
