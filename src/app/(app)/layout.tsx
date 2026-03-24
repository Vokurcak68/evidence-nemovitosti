import { requireUser, getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { T } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const profile = await getCurrentProfile();

  const supabase = await createSupabaseServerClient();
  const todayStr = new Date().toISOString().slice(0, 10);

  const { count } = await supabase
    .from(T.tasks)
    .select("id", { count: "exact", head: true })
    .eq("status", "todo")
    .lte("reminder_date", todayStr)
    .eq("reminder_sent", false);

  return (
    <AuthProvider>
      <AppShell isAdmin={profile.role === "admin"} remindersCount={count ?? 0}>
        {children}
      </AppShell>
    </AuthProvider>
  );
}
