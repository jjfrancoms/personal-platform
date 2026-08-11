"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useProjectStore } from "../store/projectStore";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose }) => {
  const { addFolder } = useProjectStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFolder({ name, color });
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="p-6 border-white/10 shadow-2xl relative" glow>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="folder" className="text-blue-400" />
              Nueva Carpeta
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
                Nombre de la Carpeta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Cuentas Personales"
                required
                className="w-full px-4.5 py-2 bg-white/[0.03] border border-white/10 rounded-xl focus:border-blue-500/50 text-white outline-none transition-all placeholder:text-white/30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Crear Carpeta
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
