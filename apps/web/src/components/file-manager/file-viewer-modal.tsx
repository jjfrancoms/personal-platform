"use client";

import React, { useState, useMemo } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useAssetStore, AssetFile } from "../../store/assetStore";
import { useProjectStore } from "../../store/projectStore";
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
  
  const [selectedAssetForVersions, setSelectedAssetForVersions] = useState<AssetFile | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetFile | null>(null);
  const [mediaJobAsset, setMediaJobAsset] = useState<AssetFile | null>(null);
  const [newVersionSummary, setNewVersionSummary] = useState("");
  const [versionFile, setVersionFile] = useState<File | null>(null);

  const project = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const projectAssets = useMemo(() => {
    if (!projectId) return [];
    return assets.filter((a) => a.projectId === projectId);
  }, [assets, projectId]);

  if (!isOpen || !project) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
      changeSummary: newVersionSummary || `Uploaded new revision`,
    });

    setVersionFile(null);
    setNewVersionSummary("");
    setSelectedAssetForVersions(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: `${project.color}30`, border: `1px solid ${project.color}50` }}
                >
                  <Icon name="folder" size={20} style={{ color: project.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white leading-none">
                      {project.name}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {projectAssets.length} Assets
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Secure Storage • Binary Signatures • FFmpeg Processing Pipelines
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Body Section */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* Dropzone */}
              <FileDropzone projectId={project.id} />

              {/* Assets List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Stored Assets & Versions
                </h3>

                {projectAssets.length === 0 ? (
                  <div className="p-8 text-center border border-white/5 rounded-2xl bg-white/[0.01]">
                    <p className="text-xs text-slate-400">No assets uploaded to this project yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectAssets.map((asset) => {
                      const ext = asset.name.split(".").pop()?.toUpperCase() || "FILE";
                      const isImage = ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(ext);
                      const isMedia = ["MP4", "MOV", "WEBM", "MKV", "AVI", "MP3", "WAV", "AAC", "OGG"].includes(ext);

                      return (
                        <div
                          key={asset.id}
                          className="p-3.5 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl flex flex-col justify-between gap-3 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="px-2 py-1 text-[10px] font-black rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider shrink-0">
                                {ext}
                              </span>
                              <div className="truncate">
                                <p className="text-xs font-bold text-white truncate" title={asset.name}>
                                  {asset.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {formatBytes(asset.sizeBytes)} • {asset.storageProvider}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                              v{asset.currentVersion}
                            </span>
                          </div>

                          {/* Actions row */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Open Preview/Edit */}
                              <button
                                onClick={() => setPreviewAsset(asset)}
                                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                              >
                                <Icon name="project" size={12} />
                                {isImage ? "Edit Studio" : "Inspect"}
                              </button>

                              {/* Media FFmpeg Process Button */}
                              {isMedia && (
                                <button
                                  onClick={() => setMediaJobAsset(asset)}
                                  className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 text-[11px] bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20"
                                >
                                  <Icon name="settings" size={12} />
                                  FFmpeg
                                </button>
                              )}

                              {/* Version history */}
                              <button
                                onClick={() => setSelectedAssetForVersions(asset)}
                                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                v{asset.currentVersion} ({asset.versions.length})
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => alert(`Storage Key: ${asset.storageKey}`)}
                                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded"
                                title="Copy Storage Key"
                              >
                                <Icon name="copy" size={13} />
                              </button>
                              <button
                                onClick={() => deleteAsset(asset.id)}
                                className="p-1 hover:bg-white/5 text-slate-400 hover:text-red-400 rounded"
                                title="Delete Asset"
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Version History Drawer / Modal */}
            {selectedAssetForVersions && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col z-30 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Version History: {selectedAssetForVersions.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Non-destructive revisions. Every version is preserved safely.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssetForVersions(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>

                {/* Upload new version form */}
                <form onSubmit={handleUploadNewVersionSubmit} className="p-3 bg-white/[0.02] border border-white/10 rounded-xl mb-4 space-y-2.5">
                  <p className="text-xs font-semibold text-blue-300">Upload Revision v{selectedAssetForVersions.currentVersion + 1}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="file"
                      required
                      onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-blue-600/30 file:text-blue-200"
                    />
                    <input
                      type="text"
                      value={newVersionSummary}
                      onChange={(e) => setNewVersionSummary(e.target.value)}
                      placeholder="Change summary (e.g. fixed textures)"
                      className="px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <GlassButton type="submit" variant="primary" size="sm">
                      Publish New Version
                    </GlassButton>
                  </div>
                </form>

                {/* List of past versions */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {selectedAssetForVersions.versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">v{ver.versionNumber}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ver.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{ver.changeSummary}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatBytes(ver.sizeBytes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </GlassCard>
        </div>
      </div>

      {/* Universal Preview Modal */}
      <UniversalFilePreviewModal
        isOpen={previewAsset !== null}
        onClose={() => setPreviewAsset(null)}
        asset={previewAsset}
      />

      {/* Media FFmpeg Job Modal */}
      <MediaJobModal
        isOpen={mediaJobAsset !== null}
        onClose={() => setMediaJobAsset(null)}
        asset={mediaJobAsset}
      />
    </>
  );
};
