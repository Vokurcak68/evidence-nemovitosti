"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Přihlášení se nepovedlo. Zkontroluj email a heslo.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_circle_at_0%_0%,rgba(16,185,129,0.18),transparent_60%),radial-gradient(900px_circle_at_100%_0%,rgba(16,185,129,0.10),transparent_60%)] px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-emerald-900">Evidence nemovitostí</h1>
          <p className="mt-2 text-sm text-slate-600">Přihlášení je pouze pro pozvané uživatele.</p>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@firma.cz" />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Heslo</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </label>

            {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Přihlašuji…" : "Přihlásit se"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
