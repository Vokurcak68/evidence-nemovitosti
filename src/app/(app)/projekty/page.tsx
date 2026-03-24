export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { T } from "@/lib/tables";
import type { Project } from "@/lib/types";
import { ProjectList } from "@/components/project-list";

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: projects } = await supabase.from(T.projects).select("*").order("name", { ascending: true });
  const list = (projects ?? []) as Project[];

  return <ProjectList projects={list} />;
}
