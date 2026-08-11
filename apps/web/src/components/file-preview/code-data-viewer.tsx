"use client";

import React, { useState, useEffect } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";
import { JsonYamlProcessor } from "@personal-platform/processors";

interface CodeDataViewerProps {
  content: string;
  filename: string;
  format: "json" | "yaml" | "xml" | "txt";
}

export const CodeDataViewer: React.FC<CodeDataViewerProps> = ({
  content: initialContent,
  filename,
  format,
}) => {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState<"raw" | "yaml">(format === "yaml" ? "yaml" : "raw");

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleFormat = () => {
    if (format === "json") {
      const res = JsonYamlProcessor.formatJson(content);
      if (res.success) setContent(res.formatted);
    } else if (format === "xml") {
      setContent(JsonYamlProcessor.formatXml(content));
    }
  };

  const handleConvertToYaml = () => {
    if (format === "json") {
      try {
        const parsed = JSON.parse(content);
        const yamlStr = JsonYamlProcessor.jsonToYaml(parsed);
        setContent(yamlStr);
        setDisplayMode("yaml");
      } catch (err) {
        alert("Invalid JSON format cannot be converted to YAML.");
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content.split("\n");

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono uppercase font-bold text-[10px]">
            {format}
          </span>
          <span className="text-slate-400 text-[11px]">{lines.length} lines • {content.length} characters</span>
        </div>

        <div className="flex items-center gap-2">
          {(format === "json" || format === "xml") && (
            <GlassButton onClick={handleFormat} variant="secondary" size="sm" className="text-xs py-1">
              Prettify
            </GlassButton>
          )}

          {format === "json" && displayMode !== "yaml" && (
            <GlassButton onClick={handleConvertToYaml} variant="secondary" size="sm" className="text-xs py-1">
              Convert to YAML
            </GlassButton>
          )}

          <GlassButton onClick={handleCopy} variant="secondary" size="sm" className="text-xs py-1">
            <Icon name={copied ? "check" : "copy"} size={12} />
            {copied ? "Copied" : "Copy"}
          </GlassButton>
        </div>
      </div>

      {/* Code Editor / Inspector Box */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/60 p-4 font-mono text-xs text-slate-200 flex">
        {/* Line Numbers */}
        <div className="select-none text-slate-600 text-right pr-4 border-r border-white/5 space-y-1">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <div className="pl-4 flex-1 overflow-x-auto whitespace-pre space-y-1 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
};
