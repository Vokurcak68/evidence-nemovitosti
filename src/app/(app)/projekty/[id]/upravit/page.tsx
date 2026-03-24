export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { T } from "@/lib/tables";
import { requireUser } from "@/lib/auth";
import { ProjectForm } from "@/components/project-form";
import type { Project } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase.from(T.projects).select("*").eq("id", id).maybeSingle<Project>();
  if (!project) notFound();

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-900">Upravit projekt</h1>
      <ProjectForm project={project} userId={user.id} />
    </div>
  );
}
