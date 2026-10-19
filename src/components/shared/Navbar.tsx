import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthControls } from "./AuthControls";
import { MainNav } from "./MainNav";

export async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl font-bold leading-none text-primary-foreground shadow-sm transition-transform duration-200 group-hover:rotate-6">
            ⋈
          </span>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            JoinLab
          </span>
        </Link>

        <MainNav />

        <div className="flex items-center gap-2 sm:gap-3">
          {user?.role === "instructor" && (
            <Link
              href="/dosen"
              title="Panel Dosen"
              className="group relative hidden h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all hover:border-border hover:bg-card hover:text-primary hover:shadow-sm md:inline-flex"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="sr-only">Panel Dosen</span>
              <span className="pointer-events-none absolute right-0 top-11 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-semibold text-background shadow-sm group-hover:block">
                Panel Dosen
              </span>
            </Link>
          )}
          <AuthControls user={user} />
        </div>
      </div>
    </header>
  );
}
