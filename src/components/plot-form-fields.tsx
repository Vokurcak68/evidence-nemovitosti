import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PlotFormValues = {
  name?: string | null;
  address?: string | null;
  cadastral_number?: string | null;
  lv_number?: string | null;
  area_m2?: number | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  notes?: string | null;
};

export function PlotFormFields({ values }: { values?: PlotFormValues }) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-700">Název pozemku *</span>
        <Input name="name" required defaultValue={values?.name ?? ""} placeholder="Např. Louka u lesa" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-700">Adresa</span>
        <Input name="address" defaultValue={values?.address ?? ""} placeholder="Město, ulice" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">Katastrální číslo</span>
          <Input name="cadastral_number" defaultValue={values?.cadastral_number ?? ""} placeholder="123/4" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">LV číslo</span>
          <Input name="lv_number" defaultValue={values?.lv_number ?? ""} placeholder="101" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">Výměra (m²)</span>
          <Input name="area_m2" type="number" step="0.01" defaultValue={values?.area_m2 ?? ""} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">GPS lat</span>
          <Input name="gps_lat" type="number" step="0.000001" defaultValue={values?.gps_lat ?? ""} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">GPS lng</span>
          <Input name="gps_lng" type="number" step="0.000001" defaultValue={values?.gps_lng ?? ""} />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-700">Poznámky</span>
        <Textarea name="notes" defaultValue={values?.notes ?? ""} placeholder="Co je potřeba vědět o pozemku" />
      </label>
    </div>
  );
}
