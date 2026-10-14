"use client";

import React, { useMemo } from "react";
import { ErdData, ErdTable } from "@/lib/domain/erd/ErdBuilder";
import { Key, Link as LinkIcon, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErdViewerProps {
  erdData: ErdData | null;
  highlightTables?: string[];
}

const KEY_GOLD = "#d9a24b";

export function ErdViewer({ erdData, highlightTables = [] }: ErdViewerProps) {
  const { tables, relations } = useMemo(() => {
    if (!erdData || !erdData.tables) {
      return { tables: [], relations: [] };
    }
    return erdData;
  }, [erdData]);

  if (!erdData || tables.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border bg-muted p-8 text-muted-foreground">
        <Database className="mb-2 h-10 w-10 stroke-border" />
        <p className="text-sm">Metadata ERD belum tersedia untuk skema ini.</p>
      </div>
    );
  }

  const maxX = Math.max(...tables.map((t) => (t.x || 0) + (t.width || 240)), 650);
  const maxY = Math.max(...tables.map((t) => (t.y || 0) + (t.height || 200)), 450);

  const tableMap = new Map<string, ErdTable>();
  tables.forEach((t) => tableMap.set(t.name.toLowerCase(), t));

  return (
    <div className="w-full overflow-auto rounded-md border border-ink-border bg-ink p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-background/60">
        <Database className="h-4 w-4 text-accent" />
        Entity Relationship Diagram (ERD)
      </div>

      <div
        className="relative rounded-md border border-ink-border bg-ink p-4"
        style={{ width: `${maxX + 60}px`, height: `${maxY + 60}px` }}
      >
        <svg
          className="pointer-events-none absolute inset-0"
          width={maxX + 60}
          height={maxY + 60}
        >
          <defs>
            <marker
              id="dot"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
            >
              <circle cx="5" cy="5" r="3" fill={KEY_GOLD} />
            </marker>
          </defs>

          {relations.map((rel, idx) => {
            const fromT = tableMap.get(rel.from_table.toLowerCase());
            const toT = tableMap.get(rel.to_table.toLowerCase());

            if (!fromT || !toT) return null;

            const fromX = (fromT.x || 0) + (fromT.width || 220) / 2;
            const fromY = (fromT.y || 0) + (fromT.height || 160) / 2;
            const toX = (toT.x || 0) + (toT.width || 220) / 2;
            const toY = (toT.y || 0) + (toT.height || 160) / 2;

            const midX = (fromX + toX) / 2;
            const pathData = `M ${fromX} ${fromY} Q ${midX} ${(fromY + toY) / 2 - 30} ${toX} ${toY}`;

            return (
              <path
                key={`rel-${idx}`}
                d={pathData}
                fill="none"
                stroke={KEY_GOLD}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                markerEnd="url(#dot)"
                opacity="0.7"
              />
            );
          })}
        </svg>

        {tables.map((tbl) => {
          const isHighlighted = highlightTables.includes(tbl.name.toLowerCase());
          return (
            <div
              key={tbl.name}
              className={cn(
                "absolute overflow-hidden rounded-md border bg-ink-muted transition-all",
                isHighlighted
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-ink-border"
              )}
              style={{
                left: `${tbl.x || 40}px`,
                top: `${tbl.y || 40}px`,
                width: `${tbl.width || 230}px`,
              }}
            >
              <div className="flex items-center justify-between border-b border-ink-border bg-ink-border/50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-background">
                  <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                  {tbl.name}
                </span>
                <span className="text-[10px] text-background/50">
                  {tbl.columns.length} kol
                </span>
              </div>

              <div className="divide-y divide-ink-border/60 text-xs">
                {tbl.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between px-3 py-1.5 text-background/80 transition-colors hover:bg-ink-border/30"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {col.pk && (
                        <Key className="h-3 w-3 flex-shrink-0 text-[oklch(0.75_0.14_78)]" />
                      )}
                      {col.fk && (
                        <LinkIcon className="h-3 w-3 flex-shrink-0 text-background/60" />
                      )}
                      <span
                        className={cn(
                          "truncate",
                          col.pk && "font-bold text-[oklch(0.82_0.12_80)]"
                        )}
                      >
                        {col.name}
                      </span>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-[10px] text-background/45">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
