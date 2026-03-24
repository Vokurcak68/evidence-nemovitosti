import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Test connection without exposing keys
  const checks = {
    supabaseUrl: url ? `${url.substring(0, 30)}...` : "MISSING",
    anonKeySet: !!anonKey,
    anonKeyLength: anonKey?.length ?? 0,
    serviceKeySet: !!serviceKey,
  };

  // Try actual auth test
  if (url && anonKey) {
    try {
      const supabase = createClient(url, anonKey);
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@test.com",
        password: "wrongpassword",
      });
      // We expect "Invalid login credentials" - that means connection works
      checks["authConnectionWorks"] = true;
      checks["authError"] = error?.message ?? "none";
    } catch (e: unknown) {
      checks["authConnectionWorks"] = false;
      checks["authError"] = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json(checks);
}
