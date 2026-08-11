"use client";

import React, { useState, useEffect } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useProjectStore, Project } from "../store/projectStore";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null; // If provided, we are editing
}

const PRESET_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#f97316", // orange
  "#ef4444", // red
  "#06b6d4", // cyan
  "#eab308", // yellow
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { projects, tags, folders, addProject, updateProject } = useProjectStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[1]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (projectId) {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          setName(project.name);
          setDescription(project.description);
          setColor(project.color);
          setSelectedTags(project.tags);
          setFolderId(project.folderId || "");
          setIsFavorite(project.isFavorite);
        }
      } else {
        setName("");
        setDescription("");
        setColor(PRESET_COLORS[1]);
        setSelectedTags([]);
        setFolderId("");
        setIsFavorite(false);
      }
    }
  }, [isOpen, projectId, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name,
      description,
      color,
      tags: selectedTags,
      folderId: folderId || undefined,
      isFavorite,
    };

    if (projectId) {
      updateProject(projectId, data);
    } else {
      addProject(data);
    }
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in text-white">
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="glass-modal-panel p-6 border-white/10 shadow-2xl relative overflow-hidden space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="project" size={18} className="text-amber-400" />
              {projectId ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Gestor de Recursos o Herramienta Mod"
                required
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-white outline-none transition-all placeholder:text-white/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los objetivos de tu proyecto, archivos asociados o tareas..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-white outline-none transition-all placeholder:text-white/30 resize-none"
              />
            </div>

            {/* Folder Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Asignar a Carpeta
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0e131f] border border-white/10 rounded-xl focus:border-blue-500/50 text-white outline-none transition-all"
              >
                <option value="">Sin carpeta (Nivel raíz)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color preset */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Color Temático
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 relative ${
                      color === c
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent hover:scale-105"
                    }`}
                  >
                    {color === c && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Etiquetas del Proyecto
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = selectedTags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      style={{
                        borderColor: active ? t.color : "rgba(255,255,255,0.08)",
                        backgroundColor: active
                          ? `${t.color}15`
                          : "rgba(255,255,255,0.02)",
                        color: active ? t.color : "rgba(255,255,255,0.6)",
                      }}
                      className="px-3 py-1 text-xs border rounded-lg transition-all duration-200 select-none font-medium hover:brightness-110"
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite status & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded bg-white/5 border border-white/10"
                />
                <span className="flex items-center gap-1">
                  <Icon
                    name={isFavorite ? "star-filled" : "star"}
                    size={16}
                    className={isFavorite ? "text-yellow-400" : "text-slate-400"}
                  />
                  Marcar como Favorito
                </span>
              </label>

              <div className="flex gap-3">
                <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancelar
                </GlassButton>
                <GlassButton type="submit" variant="primary" size="sm">
                  {projectId ? "Guardar Cambios" : "Crear Proyecto"}
                </GlassButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
