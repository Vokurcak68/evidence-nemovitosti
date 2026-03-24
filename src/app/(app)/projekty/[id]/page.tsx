export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { T } from "@/lib/tables";
import { requireUser } from "@/lib/auth";
import { ProjectDetail } from "@/components/project-detail";
import type { Project, ProjectPlot, ProjectAction, ProjectAttachment, UserProfile } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase.from(T.projects).select("*").eq("id", id).maybeSingle<Project>();
  if (!project) notFound();

  const [plotsRes, actionsRes, attachRes, usersRes] = await Promise.all([
    supabase.from(T.project_plots).select("*").eq("project_id", id).order("created_at"),
    supabase.from(T.project_actions).select("*").eq("project_id", id).order("action_date", { ascending: false }),
    supabase.from(T.project_attachments).select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from(T.user_profiles).select("*"),
  ]);

  return (
    <div className="p-4 pb-24">
      <ProjectDetail
        project={project}
        plots={(plotsRes.data ?? []) as ProjectPlot[]}
        actions={(actionsRes.data ?? []) as ProjectAction[]}
        attachments={(attachRes.data ?? []) as ProjectAttachment[]}
        users={(usersRes.data ?? []) as UserProfile[]}
        userId={user.id}
      />
    </div>
  );
}
