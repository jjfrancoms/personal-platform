"use client";

import React, { useMemo } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";
import { DocumentProcessor } from "@personal-platform/processors";

interface DocxViewerProps {
  filename: string;
}

export const DocxViewer: React.FC<DocxViewerProps> = ({ filename }) => {
  const sampleDocText = `Project Technical Report - Modular Systems

Executive Summary
The Personal Platform is designed as a high-performance, modular workstation that consolidates asset management, real-time media transformations, and format conversions in one seamless web view.

System Architecture
The system employs a Turborepo monorepo structure with pnpm workspaces. The architecture strictly separates the Next.js App Router presentation layer from asynchronous Docker worker services.

Storage and Security Protocols
All user uploads are handled via presigned URLs. Binary files are checked against magic number signatures, and file paths are assigned immutable UUID v4 identifiers to avoid path traversal vulnerabilities and ensure non-destructive revisioning.

Conclusion
The modular approach provides scalability, high reliability, and extensible integration capabilities for multimedia and data analysis pipelines.`;

  const stats = useMemo(() => {
    return DocumentProcessor.extractStats(sampleDocText);
  }, [sampleDocText]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase text-[10px]">
            DOCX
          </span>
          <span className="text-slate-400 text-xs">
            {stats.wordCount} words • {stats.readingTimeMinutes} min read • {stats.paragraphCount} sections
          </span>
        </div>

        <GlassButton
          onClick={() => alert(`Downloading Document: ${filename}`)}
          variant="secondary"
          size="sm"
          className="text-xs py-1"
        >
          Download DOCX
        </GlassButton>
      </div>

      {/* Document View */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/70 p-6 sm:p-10 flex justify-center">
        <div className="max-w-2xl w-full space-y-6 text-slate-200">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-2xl font-bold text-white leading-tight">
              Project Technical Report - Modular Systems
            </h1>
            <p className="text-xs text-slate-400 mt-1">Document: {filename} • Formatted DOCX Reader</p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide">Executive Summary</h2>
            <p>
              The Personal Platform is designed as a high-performance, modular workstation that consolidates asset management, real-time media transformations, and format conversions in one seamless web view.
            </p>

            <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide pt-2">System Architecture</h2>
            <p>
              The system employs a Turborepo monorepo structure with pnpm workspaces. The architecture strictly separates the Next.js App Router presentation layer from asynchronous Docker worker services.
            </p>

            <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide pt-2">Storage and Security Protocols</h2>
            <p>
              All user uploads are handled via presigned URLs. Binary files are checked against magic number signatures, and file paths are assigned immutable UUID v4 identifiers to avoid path traversal vulnerabilities and ensure non-destructive revisioning.
            </p>

            <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide pt-2">Conclusion</h2>
            <p>
              The modular approach provides scalability, high reliability, and extensible integration capabilities for multimedia and data analysis pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
