"use client";

import React, { useState, useMemo } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useAssetStore, AssetFile } from "../../store/assetStore";
import { useProjectStore } from "../../store/projectStore";
import { useAutomationStore } from "../../store/automationStore";
import { FileDropzone } from "./file-dropzone";
import { UniversalFilePreviewModal } from "../file-preview/universal-file-preview-modal";
import { MediaJobModal } from "../audio-video/media-job-modal";

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { assets, deleteAsset, uploadNewVersion } = useAssetStore();
  const { projects } = useProjectStore();
  const { setIsAiDrawerOpen } = useAutomationStore();
  
  const [selectedAssetForVersions, setSelectedAssetForVersions] = useState<AssetFile | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetFile | null>(null);
  const [mediaJobAsset, setMediaJobAsset] = useState<AssetFile | null>(null);
  const [newVersionSummary, setNewVersionSummary] = useState("");
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [fileSearch, setFileSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const project = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const projectAssets = useMemo(() => {
    if (!projectId) return [];
    return assets.filter((a) => {
      if (a.projectId !== projectId) return false;
      if (fileSearch.trim()) {
        return a.name.toLowerCase().includes(fileSearch.toLowerCase());
      }
      return true;
    });
  }, [assets, projectId, fileSearch]);

  if (!isOpen || !project) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileCategory = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["glb", "gltf", "obj", "fbx", "stl", "blend"].includes(ext)) return { label: "Modelo 3D", color: "#a855f7", icon: "project" as const };
    if (["bbmodel", "nbt", "jar", "schematic"].includes(ext)) return { label: "Minecraft", color: "#22c55e", icon: "project" as const };
    if (["mp4", "mov", "webm", "mkv"].includes(ext)) return { label: "Video", color: "#ec4899", icon: "dashboard" as const };
    if (["mp3", "wav", "flac", "ogg"].includes(ext)) return { label: "Audio", color: "#f97316", icon: "dashboard" as const };
    if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return { label: "Imagen", color: "#06b6d4", icon: "folder" as const };
    if (["json", "csv", "xml", "yaml", "ts", "js", "py"].includes(ext)) return { label: "Datos & Código", color: "#3b82f6", icon: "code" as const };
    if (["pdf", "docx", "xlsx", "pptx", "md", "txt"].includes(ext)) return { label: "Documento", color: "#eab308", icon: "edit" as const };
    return { label: "Archivo", color: "#94a3b8", icon: "folder" as const };
  };

  const handleUploadNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForVersions || !versionFile) return;

    await uploadNewVersion({
      assetId: selectedAssetForVersions.id,
      file: {
        name: versionFile.name,
        size: versionFile.size,
        type: versionFile.type,
      },
      changeSummary: newVersionSummary || `Nueva versión subida`,
    });

    setVersionFile(null);
    setNewVersionSummary("");
    setSelectedAssetForVersions(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fade-in text-white">
        <div className="w-full max-w-5xl h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="glass-modal-panel flex-1 flex flex-col p-5 sm:p-7 relative overflow-hidden">
            
            {/* Cabecera del Proyecto */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                  style={{
                    backgroundColor: `${project.color}25`,
                    border: `1px solid ${project.color}45`,
                    boxShadow: `0 8px 24px -4px ${project.color}30`,
                  }}
                >
                  <Icon name="folder" size={22} style={{ color: project.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white leading-none">
                      {project.name}
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-cyan-300">
                      {projectAssets.length} Archivos
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg truncate">
                    {project.description || "Almacenamiento Dual • Firmas Binarias • Procesamiento en Tiempo Real"}
                  </p>
                </div>
              </div>

              {/* Acciones Superiores */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="glass-pill px-3 py-1.5 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5"
                  title="Abrir Copiloto IA"
                >
                  <span>✨</span>
                  <span>Consultar IA</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </div>

            {/* Zona de Subida Rápida (Drag and Drop) */}
            <div className="mb-4 shrink-0">
              <FileDropzone projectId={project.id} />
            </div>

            {/* Barra de Filtro de Archivos y Vista */}
            <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Icon name="search" size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Filtrar archivos por nombre o formato..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-1 glass-pill p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all ${
                    viewMode === "grid" ? "bg-white/20 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                  title="Vista Cuadrícula"
                >
                  <Icon name="grid" size={13} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-full transition-all ${
                    viewMode === "list" ? "bg-white/20 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                  title="Vista Lista"
                >
                  <Icon name="list" size={13} />
                </button>
              </div>
            </div>

            {/* Galería de Archivos */}
            <div className="flex-1 overflow-y-auto pr-1">
              {projectAssets.length === 0 ? (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-8 glass-sub-card border border-dashed border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-3">
                    <Icon name="folder" size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">No hay archivos en este proyecto</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Arrastra archivos al recuadro superior o haz clic para subir modelos 3D, videos, documentos o texturas.
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {projectAssets.map((asset) => {
                    const cat = getFileCategory(asset.name);
                    const isMedia = ["mp4", "mov", "webm", "mp3", "wav"].includes(asset.name.split(".").pop()?.toLowerCase() || "");

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setPreviewAsset(asset)}
                        className="glass-sub-card p-4 flex flex-col justify-between gap-3 cursor-pointer group hover:border-cyan-500/40 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                            >
                              <Icon name={cat.icon} size={16} style={{ color: cat.color }} />
                            </div>
                            <div className="min-w-0 truncate">
                              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                {asset.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatBytes(asset.sizeBytes)} • v{asset.currentVersion}
                              </span>
                            </div>
                          </div>

                          {/* Badge de Categoría */}
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 border"
                            style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}35`, color: cat.color }}
                          >
                            {cat.label}
                          </span>
                        </div>

                        {/* Botones de Acción Rápida */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                          <div className="flex items-center gap-1">
                            {/* Si es multimedia, botón directo para procesar con worker FFmpeg */}
                            {isMedia && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMediaJobAsset(asset);
                                }}
                                className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-semibold border border-purple-500/30 flex items-center gap-1"
                                title="Comprimir o Convertir con FFmpeg"
                              >
                                <span>⚡</span>
                                <span>FFmpeg</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssetForVersions(asset);
                              }}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Historial de Versiones"
                            >
                              <Icon name="refresh" size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAsset(asset.id);
                              }}
                              className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              title="Eliminar Archivo"
                            >
                              <Icon name="trash" size={12} />
                            </button>
                          </div>

                          <span className="text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>Inspeccionar</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Vista en Lista */
                <div className="space-y-2">
                  {projectAssets.map((asset) => {
                    const cat = getFileCategory(asset.name);
                    const isMedia = ["mp4", "mov", "webm", "mp3", "wav"].includes(asset.name.split(".").pop()?.toLowerCase() || "");

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setPreviewAsset(asset)}
                        className="glass-sub-card p-3 flex items-center justify-between gap-4 cursor-pointer group hover:border-cyan-500/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                          >
                            <Icon name={cat.icon} size={15} style={{ color: cat.color }} />
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {asset.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              v{asset.currentVersion} • {asset.storageProvider}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono text-slate-300">
                            {formatBytes(asset.sizeBytes)}
                          </span>

                          {isMedia && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMediaJobAsset(asset);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30"
                            >
                              ⚡ FFmpeg
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAsset(asset.id);
                            }}
                            className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Secundario: Subir Nueva Versión */}
            {selectedAssetForVersions && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md p-6 glass-modal-panel border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Icon name="refresh" size={16} className="text-cyan-400" />
                      Nueva Versión: {selectedAssetForVersions.name}
                    </h3>
                    <button onClick={() => setSelectedAssetForVersions(null)} className="text-slate-400 hover:text-white">
                      <Icon name="close" size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleUploadNewVersionSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Archivo de Reemplazo</label>
                      <input
                        type="file"
                        required
                        onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Resumen del Cambio (Changelog)</label>
                      <textarea
                        rows={3}
                        value={newVersionSummary}
                        onChange={(e) => setNewVersionSummary(e.target.value)}
                        placeholder="ej: Corrección de texturas o actualización de estructura..."
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAssetForVersions(null)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!versionFile}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs disabled:opacity-50"
                      >
                        Subir Versión v{selectedAssetForVersions.currentVersion + 1}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Visualizador Universal de Archivos */}
      <UniversalFilePreviewModal
        isOpen={previewAsset !== null}
        onClose={() => setPreviewAsset(null)}
        asset={previewAsset}
      />

      {/* Modal de Tareas Multimedia FFmpeg */}
      {mediaJobAsset && (
        <MediaJobModal
          isOpen={true}
          onClose={() => setMediaJobAsset(null)}
          asset={mediaJobAsset}
        />
      )}
    </>
  );
};
