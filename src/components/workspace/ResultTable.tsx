"use client";

import React from "react";
import { Clock, Rows, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResultTableProps {
  columns: string[];
  rows: unknown[][];
  rowCount?: number;
  executionMs?: number;
  truncated?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function ResultTable({
  columns,
  rows,
  rowCount,
  executionMs,
  truncated,
  isLoading,
  error,
}: ResultTableProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border bg-card p-12 text-muted-foreground">
        <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm">Mengeksekusi query di sandbox PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="text-sm">
          <p className="mb-0.5 font-semibold">Eksekusi gagal</p>
          <p className="whitespace-pre-wrap font-mono text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center rounded-md border border-dashed bg-muted p-8 text-muted-foreground">
        <Rows className="mb-2 h-8 w-8 stroke-border" />
        <p className="text-sm">Jalankan query untuk melihat pratinjau hasil data.</p>
      </div>
    );
  }

  const displayCount = rowCount ?? rows.length;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-md border bg-card">
      <div className="flex flex-wrap items-center justify-between border-b bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-foreground">
            Hasil eksekusi ({displayCount} {displayCount === 1 ? "baris" : "baris"})
          </span>
          {executionMs !== undefined && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {executionMs} ms
            </span>
          )}
        </div>
        {truncated && (
          <Badge variant="warning">Dipotong {rows.length} baris pertama</Badge>
        )}
      </div>

      <div className="max-h-[340px] overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 select-none border-b bg-muted/70 text-muted-foreground">
            <tr>
              <th className="w-12 border-r p-2.5 pl-4 font-semibold">#</th>
              {columns.map((col, idx) => (
                <th
                  key={`${col}-${idx}`}
                  className="border-r p-2.5 font-semibold text-foreground last:border-r-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y font-mono text-foreground">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-6 text-center font-sans text-muted-foreground"
                >
                  Query berhasil dieksekusi, namun tidak ada baris data yang cocok (0 baris).
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr
                  key={`r-${rIdx}`}
                  className="transition-colors even:bg-muted/25 hover:bg-muted/50"
                >
                  <td className="select-none border-r p-2 pl-4 font-sans text-[11px] text-muted-foreground">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td
                      key={`c-${rIdx}-${cIdx}`}
                      className="whitespace-nowrap border-r p-2 last:border-r-0"
                    >
                      {cell === null ? (
                        <span className="font-sans text-[11px] italic text-muted-foreground">
                          NULL
                        </span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
