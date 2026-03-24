export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { T } from "@/lib/tables";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from(T.user_profiles).select("role").eq("id", user.id).maybeSingle();
    isAdmin = data?.role === "admin";
  }

  return (
    <AuthProvider>
      <AppShell isAdmin={isAdmin}>{children}</AppShell>
    </AuthProvider>
  );
}
