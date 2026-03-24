import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getCurrentProfile } from "@/lib/auth";
import type { UserRole } from "@/lib/types";
import { T } from "@/lib/tables";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { email?: string; full_name?: string; role?: UserRole };
  const email = String(body.email ?? "").trim();
  const full_name = String(body.full_name ?? "").trim();
  const role: UserRole = body.role === "admin" ? "admin" : "user";

  if (!email || !full_name) {
    return NextResponse.json({ error: "Chybí email nebo jméno." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Nepodařilo se vytvořit uživatele." }, { status: 500 });
  }

  const { error: profileError } = await admin.from(T.user_profiles).insert({
    id: created.user.id,
    full_name,
    email,
    role,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: created.user.id });
}
