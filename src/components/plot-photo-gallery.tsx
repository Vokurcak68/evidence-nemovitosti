"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { PlotPhoto } from "@/lib/types";

export function PlotPhotoGallery({ photos }: { photos: PlotPhoto[] }) {
  const [active, setActive] = useState<PlotPhoto | null>(null);

  if (photos.length === 0) {
    return <EmptyState icon={Camera} title="Zatím bez fotek" description="Nahraj první fotku pozemku." />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(photo)}
            className="group overflow-hidden rounded-xl border border-emerald-100 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption ?? "Fotografie pozemku"}
              className="aspect-square h-full w-full object-cover transition group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.caption ?? "Fotografie"}>
        {active ? (
          <div className="overflow-hidden rounded-xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt={active.caption ?? "Fotografie pozemku"} className="max-h-[75vh] w-full object-contain" />
          </div>
        ) : null}
      </Modal>
    </>
  );
}
