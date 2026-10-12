"use client";

import React, { useMemo } from "react";
import { ErdData, ErdTable, ErdRelation } from "@/lib/domain/erd/ErdBuilder";
import { Key, Link as LinkIcon, Database } from "lucide-react";

interface ErdViewerProps {
  erdData: ErdData | null;
  highlightTables?: string[];
}

export function ErdViewer({ erdData, highlightTables = [] }: ErdViewerProps) {
  const { tables, relations } = useMemo(() => {
    if (!erdData || !erdData.tables) {
      return { tables: [], relations: [] };
    }
    return erdData;
  }, [erdData]);

  if (!erdData || tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400 border rounded-lg bg-slate-50 min-h-[300px]">
        <Database className="w-10 h-10 mb-2 stroke-slate-300" />
        <p className="text-sm">Metadata ERD belum tersedia untuk skema ini.</p>
      </div>
    );
  }

  // Calculate canvas bounding box
  const maxX = Math.max(...tables.map((t) => (t.x || 0) + (t.width || 240)), 650);
  const maxY = Math.max(...tables.map((t) => (t.y || 0) + (t.height || 200)), 450);

  const tableMap = new Map<string, ErdTable>();
  tables.forEach((t) => tableMap.set(t.name.toLowerCase(), t));

  return (
    <div className="w-full overflow-auto border rounded-xl bg-slate-900 shadow-sm p-4 min-h-[350px]">
      <div className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-400" />
        <span>Entity Relationship Diagram (ERD)</span>
      </div>

      <div
        className="relative bg-slate-950/80 rounded-lg border border-slate-800 p-4"
        style={{ width: `${maxX + 60}px`, height: `${maxY + 60}px` }}
      >
        {/* SVG Connectors for Relations */}
        <svg
          className="absolute inset-0 pointer-events-none"
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
              <circle cx="5" cy="5" r="3" fill="#38bdf8" />
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

            // Simple bezier path
            const midX = (fromX + toX) / 2;
            const pathData = `M ${fromX} ${fromY} Q ${midX} ${(fromY + toY) / 2 - 30} ${toX} ${toY}`;

            return (
              <path
                key={`rel-${idx}`}
                d={pathData}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#dot)"
                opacity="0.75"
              />
            );
          })}
        </svg>

        {/* Tables */}
        {tables.map((tbl) => {
          const isHighlighted = highlightTables.includes(tbl.name.toLowerCase());
          return (
            <div
              key={tbl.name}
              className={`absolute rounded-lg border shadow-md overflow-hidden bg-slate-900 transition-all ${
                isHighlighted
                  ? "border-blue-400 ring-2 ring-blue-500/30"
                  : "border-slate-800"
              }`}
              style={{
                left: `${tbl.x || 40}px`,
                top: `${tbl.y || 40}px`,
                width: `${tbl.width || 230}px`,
              }}
            >
              {/* Header */}
              <div className="bg-slate-800/90 px-3 py-2 border-b border-slate-700/80 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  {tbl.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {tbl.columns.length} kol
                </span>
              </div>

              {/* Columns */}
              <div className="divide-y divide-slate-800/60 text-xs">
                {tbl.columns.map((col) => (
                  <div
                    key={col.name}
                    className="px-3 py-1.5 flex items-center justify-between text-slate-300 hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {col.pk && (
                        <Key className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      )}
                      {col.fk && (
                        <LinkIcon className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      )}
                      <span
                        className={`truncate ${
                          col.pk ? "font-bold text-amber-200" : ""
                        }`}
                      >
                        {col.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
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
