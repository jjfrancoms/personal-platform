"use client";

import React, { useState } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";

interface PdfViewerProps {
  filename: string;
  totalPages?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  filename,
  totalPages = 4,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25));

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* PDF Controls Header */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        {/* Page Switcher */}
        <div className="flex items-center gap-2">
          <GlassButton onClick={handlePrev} disabled={currentPage === 1} variant="secondary" size="sm" className="py-1 px-2.5">
            ◀
          </GlassButton>
          <span className="text-slate-300 font-mono text-xs">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <GlassButton onClick={handleNext} disabled={currentPage === totalPages} variant="secondary" size="sm" className="py-1 px-2.5">
            ▶
          </GlassButton>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <GlassButton onClick={handleZoomOut} variant="secondary" size="sm" className="py-1 px-2">
            -
          </GlassButton>
          <span className="font-mono text-cyan-400 text-xs w-12 text-center">{zoom}%</span>
          <GlassButton onClick={handleZoomIn} variant="secondary" size="sm" className="py-1 px-2">
            +
          </GlassButton>
        </div>

        {/* Download Action */}
        <GlassButton
          onClick={() => alert(`Downloading PDF: ${filename}`)}
          variant="primary"
          size="sm"
          className="text-xs py-1"
        >
          Download PDF
        </GlassButton>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/80 p-6 flex justify-center items-start">
        <div
          className="bg-white text-slate-900 rounded-xl shadow-2xl p-8 transition-all duration-200 min-h-[500px] flex flex-col justify-between"
          style={{
            width: `${Math.round(595 * (zoom / 100))}px`,
            minHeight: `${Math.round(842 * (zoom / 100))}px`,
            fontSize: `${Math.round(14 * (zoom / 100))}px`,
          }}
        >
          <div className="space-y-4">
            {/* Header Document simulation */}
            <div className="border-b pb-4 flex justify-between items-center text-slate-500 text-xs">
              <span>{filename}</span>
              <span>CONFIDENTIAL • PERSONAL PLATFORM</span>
            </div>

            {/* Document body for current page */}
            {currentPage === 1 && (
              <div className="space-y-3">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  Software Architecture & Modular Monorepo Specification
                </h1>
                <p className="text-slate-600 leading-relaxed">
                  This document describes the unified platform architecture, storage adapters, security validation routines, and in-browser processing modules.
                </p>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 my-4 text-xs font-mono">
                  <p><strong>System ID:</strong> PP-CORE-2026</p>
                  <p><strong>Storage Engine:</strong> Dual-Engine (Supabase + Cloudflare R2)</p>
                  <p><strong>Security Layer:</strong> Binary Magic Numbers + SVG Sanitization</p>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  1. <strong>Separation of Concerns:</strong> The platform isolates client-side operations (App Router, UI components) from asynchronous media processing tasks (Docker Worker with FFmpeg).
                </p>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">2. Storage Protocol & Signed URLs</h2>
                <p className="text-slate-600 leading-relaxed">
                  All asset transfers use direct signed URL uploads to ensure that large binary streams bypass the web server. Original files are preserved immutably with UUID keys.
                </p>
                <ul className="list-disc ml-5 space-y-1 text-slate-700 text-sm">
                  <li>Zero-egress object storage via Cloudflare R2</li>
                  <li>PostgreSQL integration via Supabase Storage</li>
                  <li>Automatic version history and non-destructive revisions</li>
                </ul>
              </div>
            )}

            {currentPage === 3 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">3. Media & 3D Pipelines</h2>
                <p className="text-slate-600 leading-relaxed">
                  The system integrates fluent FFmpeg for video compression, GIF generation, and audio transcoding. 3D formats are previewed directly via WebGL Three.js shaders.
                </p>
              </div>
            )}

            {currentPage === 4 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">4. Appendix & References</h2>
                <p className="text-slate-600 leading-relaxed">
                  End of document specification. Generated on August 2026.
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-4 text-center text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};
