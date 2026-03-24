import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { UserProfile, UserRole } from "@/lib/types";
import { T } from "@/lib/tables";

export const dynamic = "force-dynamic";

async function getUsers() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from(T.user_profiles)
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as UserProfile[];
}

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getUsers();

  async function inviteUser(formData: FormData) {
    "use server";

    await requireAdmin();

    const email = String(formData.get("email") ?? "").trim();
    const full_name = String(formData.get("full_name") ?? "").trim();
    const role = (String(formData.get("role") ?? "user") as UserRole) || "user";

    if (!email || !full_name) throw new Error("Email a jméno jsou povinné.");

    const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Invite selhalo.");
    }

    await admin.from(T.user_profiles).upsert(
      { id: data.user.id, full_name, email, role },
      { onConflict: "id" },
    );

    revalidatePath("/admin/uzivatele");
  }

  async function deleteUser(formData: FormData) {
    "use server";

    await requireAdmin();
    const userId = String(formData.get("user_id") ?? "");

    const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
    const admin = createSupabaseAdminClient();

    await admin.auth.admin.deleteUser(userId);
    await admin.from(T.user_profiles).delete().eq("id", userId);

    revalidatePath("/admin/uzivatele");
  }

  async function changeRole(formData: FormData) {
    "use server";

    await requireAdmin();

    const userId = String(formData.get("user_id") ?? "");
    const role = String(formData.get("role") ?? "user") as UserRole;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from(T.user_profiles).update({ role }).eq("id", userId);

    if (error) throw new Error("Nepodařilo se změnit roli.");

    revalidatePath("/admin/uzivatele");
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-extrabold text-emerald-900">Správa uživatelů</h2>
        <p className="text-sm text-slate-600">Pozvánky fungují přes Supabase Admin API. Registrace není veřejná.</p>

        <form action={inviteUser} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Jméno</span>
              <input
                name="full_name"
                placeholder="Jan Novák"
                required
                className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                placeholder="jan.novak@firma.cz"
                required
                className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select
              name="role"
              defaultValue="user"
              className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-emerald-300"
            >
              <option value="user">Uživatel</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-base font-semibold text-white"
          >
            Pozvat uživatele (email)
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-extrabold text-emerald-900">Seznam</h2>
        {users.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-emerald-200 bg-white/60 p-6 text-center">
            <div className="text-base font-extrabold text-emerald-900">Zatím žádní uživatelé</div>
            <div className="mt-1 text-sm text-slate-600">Pozvi první uživatele.</div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {users.map((u) => (
              <div key={u.id} className="rounded-3xl bg-white p-4 ring-1 ring-emerald-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-extrabold text-emerald-900">{u.full_name}</div>
                    <div className="mt-1 text-sm text-slate-700">{u.email}</div>
                    <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                      {u.role === "admin" ? "Admin" : "Uživatel"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <form action={changeRole} className="flex items-center gap-2">
                      <input type="hidden" name="user_id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-xl border border-emerald-100 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                      >
                        <option value="user">Uživatel</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-50"
                      >
                        Uložit
                      </button>
                    </form>

                    <form action={deleteUser}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Smazat
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
