"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { Button, buttonVariants } from "@/components/ui/button";

export function AuthControls({ user }: { user: SessionUser | null }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <LogIn className="h-3.5 w-3.5" />
          Masuk
        </Link>
        <Link
          href="/register"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden flex-col items-end leading-tight sm:flex">
        <span className="text-xs font-semibold text-foreground">{user.name}</span>
        <span className="text-[10px] capitalize text-muted-foreground">
          {user.role}
        </span>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={handleLogout}>
        <LogOut className="h-3.5 w-3.5" />
        Keluar
      </Button>
    </div>
  );
}
