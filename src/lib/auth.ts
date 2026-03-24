import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { UserProfile } from "@/lib/types";
import { T } from "@/lib/tables";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentProfile() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(T.user_profiles)
    .select("*")
    .eq("id", user.id)
    .single<UserProfile>();

  if (error || !data) {
    throw new Error("Nepodařilo se načíst profil uživatele.");
  }

  return data;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
