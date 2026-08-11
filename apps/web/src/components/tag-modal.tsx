"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useProjectStore } from "../store/projectStore";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose }) => {
  const { addTag } = useProjectStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTag({ name, color });
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="p-6 border-white/10 shadow-2xl relative" glow>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color }} />
              Create Tag
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tag Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next.js"
                required
                className="w-full px-4.5 py-2 bg-white/[0.03] border border-white/10 rounded-xl focus:border-blue-500/50 text-white outline-none transition-all placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Tag Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 relative ${
                      color === c
                        ? "border-white scale-110 shadow-md"
                        : "border-transparent hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Create Tag
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
