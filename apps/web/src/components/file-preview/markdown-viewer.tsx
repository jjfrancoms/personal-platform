"use client";

import React, { useState } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";

interface MarkdownViewerProps {
  content: string;
  filename: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, filename }) => {
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple and safe client markdown renderer
  const renderMarkdown = (md: string) => {
    return md
      .split("\n")
      .map((line, idx) => {
        if (line.startsWith("# ")) {
          return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={idx} className="text-lg font-bold text-blue-300 mt-3 mb-1.5">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={idx} className="text-sm font-bold text-cyan-300 mt-2 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <li key={idx} className="ml-4 text-xs text-slate-300 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith("> ")) {
          return (
            <div key={idx} className="border-l-2 border-blue-500/50 pl-3 py-1 my-2 text-xs text-blue-200 bg-blue-500/5 rounded-r">
              {line.slice(2)}
            </div>
          );
        }
        if (line.trim() === "") {
          return <div key={idx} className="h-2" />;
        }
        return <p key={idx} className="text-xs text-slate-300 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex bg-slate-900/40 p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === "preview" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Rendered Preview
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === "raw" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Raw Markdown
          </button>
        </div>

        <GlassButton onClick={handleCopy} variant="secondary" size="sm" className="text-xs py-1">
          <Icon name={copied ? "check" : "copy"} size={12} />
          {copied ? "Copied" : "Copy"}
        </GlassButton>
      </div>

      {/* Content box */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/60 p-5">
        {viewMode === "preview" ? (
          <div className="space-y-1 max-w-none">{renderMarkdown(content)}</div>
        ) : (
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{content}</pre>
        )}
      </div>
    </div>
  );
};
