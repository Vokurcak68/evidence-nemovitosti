"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Home, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  isAdmin: boolean;
};

const items = [
  { href: "/", label: "Přehled", icon: Home },
  { href: "/projekty", label: "Projekty", icon: FolderOpen },
] as const;

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-emerald-700" : "text-slate-400 hover:text-slate-600",
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-emerald-600")} />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin/uzivatele"
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
              pathname.startsWith("/admin") ? "text-emerald-700" : "text-slate-400 hover:text-slate-600",
            )}
          >
            <Shield className={cn("h-5 w-5", pathname.startsWith("/admin") && "text-emerald-600")} />
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
}
