export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { T } from "@/lib/tables";
import type { UserProfile } from "@/lib/types";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from(T.user_profiles).select("*").order("created_at", { ascending: false });
  const users = (data ?? []) as UserProfile[];

  async function inviteUser(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    if (!email || !name) return;

    const password = formData.get("password") as string;
    if (!password || password.length < 6) return;

    const admin = createSupabaseAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
    });

    if (authError || !authData.user) return;

    await admin.from(T.user_profiles).upsert({
      id: authData.user.id,
      full_name: name,
      email,
      role: "user",
    });

    redirect("/admin/uzivatele");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    if (!userId) return;

    const me = await createSupabaseServerClient();
    const {
      data: { user },
    } = await me.auth.getUser();

    // Safety: don't allow deleting currently logged-in admin from this UI
    if (user?.id === userId) {
      redirect("/admin/uzivatele");
    }

    const admin = createSupabaseAdminClient();

    // Break FK references first (created_by / uploaded_by)
    await Promise.all([
      admin.from(T.projects).update({ created_by: null }).eq("created_by", userId),
      admin.from(T.project_actions).update({ created_by: null }).eq("created_by", userId),
      admin.from(T.project_attachments).update({ uploaded_by: null }).eq("uploaded_by", userId),
    ]);

    // Delete auth user only; profile row is linked via ON DELETE CASCADE
    await admin.auth.admin.deleteUser(userId);

    redirect("/admin/uzivatele");
  }

  async function changeRole(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;
    if (!userId || !role) return;
    const sb = await createSupabaseServerClient();
    await sb.from(T.user_profiles).update({ role }).eq("id", userId);
    redirect("/admin/uzivatele");
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-900">Správa uživatelů</h1>

      <Card>
        <form action={inviteUser} className="space-y-3 p-1">
          <h2 className="text-sm font-semibold text-slate-700">Pozvat uživatele</h2>
          <div className="grid grid-cols-2 gap-2">
            <Input name="name" required placeholder="Jméno" />
            <Input name="email" type="email" required placeholder="Email" />
          </div>
          <Input name="password" type="text" required minLength={6} placeholder="Heslo (min. 6 znaků)" />
          <Button type="submit" className="w-full">Vytvořit účet</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{u.full_name}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <form action={changeRole}>
                <input type="hidden" name="userId" value={u.id} />
                <input type="hidden" name="role" value={u.role === "admin" ? "user" : "admin"} />
                <Button type="submit" variant="secondary" size="sm">
                  {u.role === "admin" ? "→ User" : "→ Admin"}
                </Button>
              </form>
              <form action={deleteUser}>
                <input type="hidden" name="userId" value={u.id} />
                <Button type="submit" variant="secondary" size="sm" className="text-red-600">
                  Smazat
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
