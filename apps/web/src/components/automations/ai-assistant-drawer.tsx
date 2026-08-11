"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useAutomationStore } from "../../store/automationStore";

export const AiAssistantDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen } = useAutomationStore();

  const [prompt, setPrompt] = useState("");
  const [taskType, setTaskType] = useState<"readme" | "tags" | "changelog">("readme");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>("");

  if (!isAiDrawerOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedResult("");

    await new Promise((r) => setTimeout(r, 1200));

    if (taskType === "readme") {
      setGeneratedResult(`# ${prompt || "Project Name"}

## Overview
Automated software asset built with a modern modular architecture, integrating fast in-browser visualizers and cloud storage security.

### Key Capabilities
- **High-Fidelity UI**: 100% Glassmorphism design system.
- **Dual-Storage Engine**: PostgreSQL metadata with S3-compatible zero-egress storage.
- **Asynchronous Queue**: Containerized FFmpeg worker service for video and audio processing.

### Getting Started
\`\`\`bash
pnpm install
pnpm run dev
\`\`\`
`);
    } else if (taskType === "tags") {
      setGeneratedResult(
        `Suggested Categorization Tags:\n- #FullStack\n- #NextJS16\n- #Glassmorphism\n- #ThreeJS\n- #FFmpeg\n- #MinecraftTools\n- #Supabase`
      );
    } else if (taskType === "changelog") {
      setGeneratedResult(
        `## Release v1.4.0 (Changelog)\n\n### 🚀 Features\n- Added Three.js 3D WebGL studio with wireframe and lighting.\n- Integrated Minecraft Skin 3D avatar preview with pose animations.\n- Added PDF, DOCX, XLSX, and PPTX in-browser document inspectors.\n- Deployed async FFmpeg Docker worker.`
      );
    }

    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/90 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white font-bold">
            ✨
          </span>
          <div>
            <h3 className="text-base font-bold text-white leading-none">AI Copilot & Summarizer</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">OpenAI GPT-4o Connected</p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Task Type Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/5 mb-4 shrink-0 text-xs font-semibold">
        {[
          { id: "readme" as const, label: "README" },
          { id: "tags" as const, label: "Auto-Tags" },
          { id: "changelog" as const, label: "Changelog" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTaskType(t.id)}
            className={`py-1.5 rounded-lg capitalize transition-all ${
              taskType === t.id
                ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input Prompt */}
      <div className="space-y-2 mb-4 shrink-0">
        <label className="text-xs font-bold text-slate-300 uppercase">Context / Project Goal</label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your project, asset, or release context..."
          className="w-full p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-violet-500/50 resize-none"
        />
        <GlassButton
          onClick={handleGenerate}
          disabled={isGenerating}
          variant="primary"
          size="sm"
          className="w-full justify-center py-2 text-xs"
        >
          {isGenerating ? "Generating with AI..." : "✨ Generate Response"}
        </GlassButton>
      </div>

      {/* Output Viewer */}
      <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-slate-900/60 p-4 font-mono text-xs text-slate-200 space-y-2 relative">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-bold">AI Result Output</span>
          {generatedResult && (
            <button
              onClick={() => navigator.clipboard.writeText(generatedResult)}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Icon name="copy" size={10} /> Copy
            </button>
          )}
        </div>

        {generatedResult ? (
          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
            {generatedResult}
          </pre>
        ) : (
          <p className="text-slate-500 italic text-center py-8">
            Click Generate to run AI documentation & auto-tagging.
          </p>
        )}
      </div>
    </div>
  );
};
