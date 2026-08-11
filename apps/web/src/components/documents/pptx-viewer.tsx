"use client";

import React, { useState } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";

interface PptxViewerProps {
  filename: string;
}

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  points: string[];
  notes: string;
}

const SAMPLE_SLIDES: SlideItem[] = [
  {
    id: 1,
    title: "Personal Platform Overview",
    subtitle: "Unified Modular Workstation & Processing Engine",
    points: [
      "Monorepo Architecture (Turborepo + pnpm)",
      "Next.js App Router with Glassmorphism Aesthetic",
      "Centralized Settings Hub with Dual-Storage Adapters",
    ],
    notes: "Present the core architectural advantages and high-level structure.",
  },
  {
    id: 2,
    title: "Dual Storage Engine",
    subtitle: "PostgreSQL Metadata + S3 Compatible Storage",
    points: [
      "Supabase Storage for direct relational access",
      "Cloudflare R2 for zero-egress large object files",
      "Binary Magic Number security validation against tampering",
    ],
    notes: "Highlight the cost savings of zero-egress storage with Cloudflare R2.",
  },
  {
    id: 3,
    title: "Multimedia & Asynchronous Workers",
    subtitle: "FFmpeg Containerized Microservice Pipelines",
    points: [
      "H.264 / WebM video compression with CRF presets",
      "Audio transcoding to MP3, WAV, AAC, and FLAC",
      "Real-time task queue with progress monitoring",
    ],
    notes: "Demonstrate live progress bar and non-blocking background queue.",
  },
  {
    id: 4,
    title: "Extensible Roadmap & 3D Tools",
    subtitle: "Future Phases: 3D Three.js & Minecraft Inspect",
    points: [
      "In-browser 3D model inspector (GLB, OBJ, STL)",
      "Dedicated Minecraft Skin & NBT datatree visualizer",
      "OpenAI & GitHub external automation connectors",
    ],
    notes: "Conclude with upcoming features and roadmap timeline.",
  },
];

export const PptxViewer: React.FC<PptxViewerProps> = ({ filename }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const currentSlide = SAMPLE_SLIDES[currentSlideIndex] || SAMPLE_SLIDES[0];

  const handlePrev = () => setCurrentSlideIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentSlideIndex((i) => Math.min(SAMPLE_SLIDES.length - 1, i + 1));

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Presentation Bar */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
            PPTX
          </span>
          <span className="text-slate-300 font-mono">
            Slide <strong>{currentSlideIndex + 1}</strong> of <strong>{SAMPLE_SLIDES.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton onClick={handlePrev} disabled={currentSlideIndex === 0} variant="secondary" size="sm" className="py-1 px-2.5">
            ◀ Prev
          </GlassButton>
          <GlassButton onClick={handleNext} disabled={currentSlideIndex === SAMPLE_SLIDES.length - 1} variant="secondary" size="sm" className="py-1 px-2.5">
            Next ▶
          </GlassButton>
          <GlassButton onClick={() => setShowNotes(!showNotes)} variant={showNotes ? "primary" : "secondary"} size="sm" className="py-1">
            {showNotes ? "Hide Notes" : "Speaker Notes"}
          </GlassButton>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/80 p-6 flex flex-col justify-between items-center relative">
        <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">{currentSlide.title}</h2>
            <p className="text-xs font-semibold text-cyan-400">{currentSlide.subtitle}</p>
          </div>

          <div className="space-y-2.5">
            {currentSlide.points.map((pt, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
            <span>{filename}</span>
            <span>Personal Platform Slide Deck</span>
          </div>
        </div>

        {/* Presenter Notes */}
        {showNotes && (
          <div className="w-full max-w-2xl mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 animate-fade-in">
            <strong>Speaker Notes:</strong> {currentSlide.notes}
          </div>
        )}
      </div>

      {/* Slide Thumbnails Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SAMPLE_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`w-28 p-2 rounded-lg border text-left transition-all shrink-0 ${
              currentSlideIndex === idx
                ? "bg-blue-600/30 border-blue-500/50 text-white"
                : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20"
            }`}
          >
            <p className="text-[10px] font-bold truncate">Slide {slide.id}</p>
            <p className="text-[9px] text-slate-400 truncate">{slide.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
