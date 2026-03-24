export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { ProjectForm } from "@/components/project-form";

export default async function NewProjectPage() {
  const user = await requireUser();

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-900">Nový projekt</h1>
      <ProjectForm userId={user.id} />
    </div>
  );
}
