"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, MapPinned, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  isAdmin: boolean;
  remindersCount: number;
};

const items = [
  { href: "/", label: "Přehled", icon: Home },
  { href: "/pozemky", label: "Pozemky", icon: MapPinned },
  { href: "/ukoly", label: "Úkoly", icon: ListChecks },
] as const;

export function BottomNav({ isAdmin, remindersCount }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-100 bg-white/95 pb-safe backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition",
                  active ? "text-emerald-700" : "text-slate-500",
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.href === "/ukoly" && remindersCount > 0 ? (
                  <span className="absolute right-5 top-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {remindersCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}

        {isAdmin ? (
          <li>
            <Link
              href="/admin/uzivatele"
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition",
                pathname.startsWith("/admin") ? "text-emerald-700" : "text-slate-500",
              )}
            >
              <Shield size={18} />
              <span>Admin</span>
            </Link>
          </li>
        ) : (
          <li className="min-h-16" />
        )}
      </ul>
    </nav>
  );
}
