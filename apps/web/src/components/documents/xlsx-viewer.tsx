"use client";

import React, { useState } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";

interface XlsxViewerProps {
  filename: string;
}

interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

const SAMPLE_SHEETS: SheetData[] = [
  {
    name: "Revenue Summary",
    headers: ["Quarter", "Target Revenue", "Actual Revenue", "Growth (%)", "Status"],
    rows: [
      ["Q1 2026", "$120,000", "$145,200", "+21.0%", "Exceeded"],
      ["Q2 2026", "$150,000", "$168,900", "+12.6%", "Exceeded"],
      ["Q3 2026", "$180,000", "$178,000", "-1.1%", "On Track"],
      ["Q4 2026", "$220,000", "$245,500", "+11.5%", "Exceeded"],
    ],
  },
  {
    name: "Asset Inventory",
    headers: ["Asset Name", "Category", "Storage Engine", "Size (MB)", "Version"],
    rows: [
      ["steve_skin_hd.png", "Minecraft", "Supabase", "0.12 MB", "v1"],
      ["custom_swords_mod.jar", "Mods", "Supabase", "4.20 MB", "v2"],
      ["cyber_car_lowpoly.glb", "3D Models", "Cloudflare R2", "8.40 MB", "v1"],
      ["gameplay_recording_4k.mp4", "Video", "Cloudflare R2", "180.0 MB", "v1"],
    ],
  },
  {
    name: "Worker Diagnostics",
    headers: ["Pipeline", "Concurrency", "Hardware Accel", "Avg Time (s)", "Success Rate"],
    rows: [
      ["H.264 Video Compression", "4 Workers", "Enabled (GPU)", "12.4s", "99.8%"],
      ["Animated GIF Converter", "2 Workers", "Disabled", "4.1s", "100%"],
      ["Audio Transcoding MP3", "8 Workers", "Enabled", "1.2s", "100%"],
    ],
  },
];

export const XlsxViewer: React.FC<XlsxViewerProps> = ({ filename }) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const activeSheet = SAMPLE_SHEETS[activeSheetIndex] || SAMPLE_SHEETS[0];

  const filteredRows = activeSheet.rows.filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
            XLSX
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in sheet..."
              className="pl-7 pr-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white outline-none w-44 focus:border-emerald-500/50"
            />
            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 pointer-events-none">
              <Icon name="search" size={12} />
            </span>
          </div>
        </div>

        {/* Sheet Tabs */}
        <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 overflow-x-auto">
          {SAMPLE_SHEETS.map((sheet, idx) => (
            <button
              key={sheet.name}
              onClick={() => setActiveSheetIndex(idx)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeSheetIndex === idx
                  ? "bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/60 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-slate-300 select-none z-10">
            <tr>
              <th className="p-2 w-10 text-center text-slate-500 border-r border-white/5">#</th>
              {activeSheet.headers.map((header) => (
                <th key={header} className="p-2.5 font-bold border-r border-white/5 text-slate-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300 text-[11px]">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={activeSheet.headers.length + 1} className="p-6 text-center text-slate-500 italic">
                  No matching cell records found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-2 text-center text-slate-500 border-r border-white/5 bg-slate-900/30">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 border-r border-white/5 truncate max-w-[200px]">
                      {cell}
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
