"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Home, Shield } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { SignOutButton } from "@/components/signout-button";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  isAdmin,
}: Readonly<{
  children: React.ReactNode;
  isAdmin: boolean;
}>) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    { href: "/", label: "Přehled", icon: Home },
    { href: "/projekty", label: "Projekty", icon: FolderOpen },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin/uzivatele", label: "Admin", icon: Shield });
  }

  const initials =
    profile?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_circle_at_0%_0%,rgba(16,185,129,0.14),transparent_60%),radial-gradient(1000px_circle_at_100%_0%,rgba(16,185,129,0.10),transparent_60%)]">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-extrabold text-emerald-800">
            Evidence nemovitostí
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 sm:flex">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {initials}
              </span>
              <div className="text-sm leading-tight">
                <p className="font-semibold text-emerald-900">{profile?.full_name ?? "Uživatel"}</p>
                <p className="text-xs text-emerald-700/80">{profile?.email ?? ""}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-emerald-100 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    active ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50",
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="w-full min-w-0 pb-20 md:pb-8">{children}</main>
      </div>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
