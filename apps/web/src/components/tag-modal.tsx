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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in text-white">
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="glass-modal-panel p-6 border-white/10 shadow-2xl relative space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color }} />
              Nueva Etiqueta
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Nombre de la Etiqueta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Producción o Cuentas"
                required
                className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500/50 text-xs text-white outline-none transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Color de la Etiqueta
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
                        ? "border-white scale-110 shadow-md shadow-cyan-500/30"
                        : "border-transparent hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Crear Etiqueta
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
