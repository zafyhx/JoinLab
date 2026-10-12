"use client";

import React from "react";
import { Clock, Rows, AlertCircle } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 border rounded-lg bg-white min-h-[220px]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Mengeksekusi query di sandbox PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-0.5">Eksekusi Gagal</p>
          <p className="text-red-600 font-mono text-xs whitespace-pre-wrap">{error}</p>
        </div>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400 border border-dashed rounded-lg bg-slate-50 min-h-[160px]">
        <Rows className="w-8 h-8 mb-2 stroke-slate-300" />
        <p className="text-sm">Jalankan query untuk melihat pratinjau hasil data.</p>
      </div>
    );
  }

  const displayCount = rowCount ?? rows.length;

  return (
    <div className="w-full flex flex-col border rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Header Info Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-800">
            Hasil Eksekusi ({displayCount} {displayCount === 1 ? "baris" : "baris"})
          </span>
          {executionMs !== undefined && (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {executionMs} ms
            </span>
          )}
        </div>
        {truncated && (
          <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Dipotong {rows.length} baris pertama
          </span>
        )}
      </div>

      {/* Table Content */}
      <div className="max-h-[340px] overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 select-none">
            <tr>
              <th className="p-2.5 pl-4 font-semibold text-slate-400 w-12 border-r border-slate-200">
                #
              </th>
              {columns.map((col, idx) => (
                <th
                  key={`${col}-${idx}`}
                  className="p-2.5 font-semibold text-slate-800 border-r border-slate-200 last:border-r-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-6 text-center text-slate-400 font-sans"
                >
                  Query berhasil dieksekusi, namun tidak ada baris data yang cocok (0 baris).
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr
                  key={`r-${rIdx}`}
                  className="hover:bg-blue-50/50 transition-colors even:bg-slate-50/50"
                >
                  <td className="p-2 pl-4 text-slate-400 text-[11px] border-r border-slate-100 font-sans select-none">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td
                      key={`c-${rIdx}-${cIdx}`}
                      className="p-2 border-r border-slate-100 last:border-r-0 whitespace-nowrap"
                    >
                      {cell === null ? (
                        <span className="text-slate-400 italic font-sans text-[11px]">
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
