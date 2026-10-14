"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Database, History, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: GraduationCap },
  { href: "/skema/akademik", label: "Latihan SQL", icon: Database },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/progres", label: "Progres", icon: BarChart3 },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
