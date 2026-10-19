"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Terminal as TerminalIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth/session";

const FULL_QUERY = `SELECT m.nama, j.nama_jurusan
FROM mahasiswa m
JOIN jurusan j
  ON m.jurusan_id = j.id;`;

interface HeroInteractiveProps {
  user: SessionUser | null;
}

export function HeroInteractive({ user }: HeroInteractiveProps) {
  const [charIndex, setCharIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger typing
  function startTyping() {
    if (isCompleted || isTyping) return;
    setHasStarted(true);
    setIsTyping(true);
  }

  // Handle typing progression
  useEffect(() => {
    if (!isTyping) return;

    if (charIndex < FULL_QUERY.length) {
      // Natural typing variation: faster for letters, small pause on newlines
      const nextChar = FULL_QUERY[charIndex];
      const delay = nextChar === "\n" ? 140 : 25 + Math.random() * 20;

      typingTimeoutRef.current = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, delay);
    } else {
      setIsTyping(false);
      setIsCompleted(true);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isTyping, charIndex]);

  // Auto start typing after 4s if guest hasn't hovered yet (for mobile & passive viewers)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasStarted) {
        startTyping();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [hasStarted]);

  function handleReset() {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setCharIndex(0);
    setIsCompleted(false);
    setIsTyping(true);
    setHasStarted(true);
  }

  // Syntax highlighter for typed SQL substring
  function renderHighlightedSQL(text: string) {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Line formatting
      const parts = line.split(/(SELECT|FROM|JOIN|ON)/g);
      return (
        <div key={lineIdx} className="leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part === "SELECT" || part === "FROM" || part === "ON") {
              return (
                <span key={pIdx} className="font-semibold text-accent">
                  {part}
                </span>
              );
            }
            if (part === "JOIN") {
              return (
                <span
                  key={pIdx}
                  className="font-bold text-[oklch(0.78_0.16_75)]"
                >
                  {part}
                </span>
              );
            }
            return (
              <span key={pIdx} className="text-background/90">
                {part}
              </span>
            );
          })}
          {lineIdx === lines.length - 1 && !isCompleted && (
            <span className="inline-block h-4 w-2 translate-y-0.5 bg-accent animate-pulse ml-0.5" />
          )}
        </div>
      );
    });
  }

  const currentTypedText = FULL_QUERY.slice(0, charIndex);

  return (
    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-16">
      {/* Left Column: Heading, description, and CTA Button */}
      <div className="hero-reveal max-w-xl">
        <h1 className="text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-6xl">
          Belajar{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SQL JOIN
          </span>{" "}
          dengan arah yang jelas.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          JoinLab melatih mahasiswa menulis query SQL JOIN pada skema database
          nyata, lalu mendiagnosis akar penyebab kesalahan penggabungan tabel
          secara rule based tanpa menebak.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {/* Main Hero CTA with interactive trigger for terminal typing */}
          <div
            className="relative group inline-flex"
            onMouseEnter={startTyping}
            onTouchStart={startTyping}
          >
            {/* Living breathing glow aura behind button */}
            <div
              aria-hidden
              className="hero-cta-glow absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-60 blur-lg transition-all duration-500 group-hover:opacity-100 group-hover:blur-xl"
            />

            <Link
              href="/dashboard"
              className="relative flex items-center gap-3.5 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-[oklch(0.48_0.19_265)] to-accent p-1.5 pr-5 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
              {/* Animated moving sheen on hover */}
              <div
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
              />

              {/* Icon container with badge effect */}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-10deg]">
                <GraduationCap className="h-5 w-5" />
              </span>

              <span className="tracking-tight">Mulai Latihan Mahasiswa</span>

              {/* Interactive Arrow Capsule */}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:translate-x-1.5 group-hover:bg-white group-hover:text-primary group-hover:shadow-md">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {user?.role === "instructor" && (
            <Link
              href="/dosen"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <ShieldCheck className="h-4 w-4 text-accent" />
              Buka Panel Dosen
            </Link>
          )}
        </div>
      </div>

      {/* Right Column: Interactive query.sql Terminal */}
      <div className="hero-reveal-delay relative mx-auto w-full max-w-xl lg:mx-0">
        <div
          aria-hidden
          className={`absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-accent/15 to-transparent blur-2xl transition-all duration-700 ${
            isTyping ? "scale-105 opacity-100" : "scale-100 opacity-60"
          }`}
        />

        <div className="relative overflow-hidden rounded-2xl border border-ink-border/80 bg-ink p-5 font-mono text-sm shadow-xl sm:p-6 transition-all duration-300">
          <div
            aria-hidden
            className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/25 blur-3xl pointer-events-none"
          />

          {/* Terminal Header Bar */}
          <div className="relative mb-5 flex items-center justify-between text-xs text-background/60">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
              <span className="ml-2 font-sans font-medium text-background/80 flex items-center gap-1.5">
                <TerminalIcon className="h-3.5 w-3.5 text-accent" />
                query.sql
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isTyping && (
                <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                  Mengetik...
                </span>
              )}

              {isCompleted && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Ketik ulang query"
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-background/70 hover:bg-white/10 hover:text-background transition-colors"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  Ulangi
                </button>
              )}

              {!hasStarted && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-background/50">
                  Standby
                </span>
              )}
            </div>
          </div>

          {/* Code Body Area with line numbers */}
          <div className="flex gap-4 min-h-[110px]">
            {/* Line numbers */}
            <div className="select-none text-background/30 text-right font-mono text-xs leading-relaxed">
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>

            {/* Code content */}
            <div className="flex-1 font-mono text-sm leading-relaxed">
              {!hasStarted && charIndex === 0 ? (
                <div className="text-background/40 italic flex items-center gap-1">
                  <span>-- Arahkan kursor ke tombol untuk mulai...</span>
                  <span className="inline-block h-4 w-1.5 bg-accent animate-pulse" />
                </div>
              ) : (
                renderHighlightedSQL(currentTypedText)
              )}
            </div>
          </div>

          {/* Success Result Simulation Bar (appears when finished) */}
          <div
            className={`mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs transition-all duration-500 ${
              isCompleted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-1.5 text-success font-sans">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Query Valid · 15 data baris digabungkan</span>
            </div>
            <span className="text-[10px] text-background/40 font-mono">
              waktu: 28ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
