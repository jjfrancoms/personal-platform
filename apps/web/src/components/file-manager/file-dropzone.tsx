"use client";

import React, { useState, useRef } from "react";
import { Icon, GlassButton } from "@personal-platform/ui";
import { useAssetStore } from "../../store/assetStore";
import { useSettingsStore } from "../../store/settingsStore";

interface FileDropzoneProps {
  projectId: string;
  folderId?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ projectId, folderId }) => {
  const { uploadAsset, uploadingFiles } = useAssetStore();
  const { storage } = useSettingsStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > storage.maxFileSizeMb * 1024 * 1024) {
        alert(`File ${file.name} exceeds max size limit of ${storage.maxFileSizeMb}MB`);
        continue;
      }

      await uploadAsset({
        projectId,
        folderId,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        provider: storage.provider === "cloudflare_r2" ? "cloudflare_r2" : "supabase",
      });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 backdrop-blur-sm ${
          isDragOver
            ? "border-blue-400 bg-blue-500/10 shadow-glow-primary scale-[1.01]"
            : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shadow-glass-sm">
            <Icon name="folder" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Drag and drop files here, or <span className="text-blue-400 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Supports 3D models (GLB, OBJ), media (MP4, PNG), Minecraft mods/NBT, and structured data (JSON, CSV). Max {storage.maxFileSizeMb}MB.
            </p>
          </div>
        </div>
      </div>

      {/* Uploading progress items */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((up) => (
            <div
              key={up.id}
              className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white truncate max-w-[200px]">{up.name}</span>
                <span className="text-[10px] text-cyan-400 font-bold">{up.progress}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${up.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
