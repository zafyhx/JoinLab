import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthControls } from "./AuthControls";
import { MainNav } from "./MainNav";

export async function Navbar({ role = "student" }: { role?: "student" | "instructor" }) {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="text-2xl font-semibold leading-none text-accent"
          >
            ⋈
          </span>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            JoinLab
          </span>
        </Link>

        <MainNav />

        <div className="flex items-center gap-2">
          <Link
            href="/dosen"
            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Panel Dosen
          </Link>
          <AuthControls user={user} />
        </div>
      </div>
    </header>
  );
}
