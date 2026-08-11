"use client";

import React, { useState, useMemo } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";
import { CsvProcessor } from "@personal-platform/processors";

interface CsvViewerProps {
  content: string;
  filename: string;
}

export const CsvViewer: React.FC<CsvViewerProps> = ({ content, filename }) => {
  const [filterText, setFilterText] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { headers, rows, totalRows, errors } = useMemo(() => {
    return CsvProcessor.parse(content);
  }, [content]);

  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    // Filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA || "").toLowerCase();
        const strB = String(valB || "").toLowerCase();
        if (strA < strB) return sortOrder === "asc" ? -1 : 1;
        if (strA > strB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, filterText, sortColumn, sortOrder]);

  const handleSort = (header: string) => {
    if (sortColumn === header) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(header);
      setSortOrder("asc");
    }
  };

  const handleExportJson = () => {
    const jsonStr = CsvProcessor.toJson(content);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.csv$/i, ".json");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter table rows..."
            className="w-full pl-8 pr-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-blue-500/50"
          />
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
            <Icon name="search" size={13} />
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] text-slate-400">
            Showing <strong>{filteredAndSortedRows.length}</strong> of <strong>{totalRows}</strong> rows
          </span>

          <GlassButton onClick={handleExportJson} variant="secondary" size="sm" className="text-xs">
            Export JSON
          </GlassButton>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-lg">
          {errors[0]}
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/40">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm border-b border-white/10 text-slate-300 select-none z-10">
            <tr>
              <th className="p-2.5 w-12 text-center text-slate-500 border-r border-white/5">#</th>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="p-2.5 font-bold hover:text-white cursor-pointer border-r border-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{header}</span>
                    {sortColumn === header && (
                      <span className="text-[10px] text-blue-400">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200 font-mono text-[11px]">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="p-6 text-center text-slate-400 italic">
                  No matching records found.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-2 text-center text-slate-500 border-r border-white/5">{idx + 1}</td>
                  {headers.map((header) => (
                    <td key={header} className="p-2 border-r border-white/5 truncate max-w-[200px]" title={String(row[header] || "")}>
                      {String(row[header] ?? "")}
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
};
