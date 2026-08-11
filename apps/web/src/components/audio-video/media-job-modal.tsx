"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useJobStore } from "../../store/jobStore";
import { AssetFile } from "../../store/assetStore";

interface MediaJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetFile | null;
}

export const MediaJobModal: React.FC<MediaJobModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { dispatchJob } = useJobStore();

  const [jobType, setJobType] = useState<"video_compress" | "video_to_gif" | "audio_convert" | "extract_thumbnail">("video_compress");
  const [resolution, setResolution] = useState<"1080p" | "720p" | "480p" | "original">("720p");
  const [crf, setCrf] = useState(24);
  const [audioBitrate, setAudioBitrate] = useState<"320k" | "192k" | "128k">("192k");
  const [outputFormat, setOutputFormat] = useState<"mp4" | "webm" | "mp3" | "gif">("mp4");

  if (!isOpen || !asset) return null;

  const isVideo = asset.name.match(/\.(mp4|mov|webm|mkv|avi)$/i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseName = asset.name.replace(/\.[^/.]+$/, "");
    let outputName = `${baseName}_comprimido.mp4`;

    if (jobType === "video_to_gif") {
      outputName = `${baseName}_animacion.gif`;
    } else if (jobType === "audio_convert") {
      outputName = `${baseName}_audio.mp3`;
    } else if (jobType === "extract_thumbnail") {
      outputName = `${baseName}_miniatura.png`;
    } else if (outputFormat === "webm") {
      outputName = `${baseName}_${resolution}.webm`;
    } else {
      outputName = `${baseName}_${resolution}.mp4`;
    }

    await dispatchJob({
      projectId: asset.projectId,
      assetId: asset.id,
      assetName: asset.name,
      type: jobType,
      outputName,
      options: {
        crf,
        resolution,
        audioBitrate,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="glass-modal-panel p-6 border-white/10 shadow-2xl relative overflow-hidden space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Icon name="settings" size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pipeline de Procesamiento FFmpeg</h3>
                <p className="text-[11px] text-slate-400 font-mono">Archivo: {asset.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
              <Icon name="close" size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Acción de Procesamiento */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Acción de Procesamiento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "video_compress" as const, label: "Comprimir Video (H.264)", available: !!isVideo },
                  { id: "video_to_gif" as const, label: "Convertir a GIF Animado", available: !!isVideo },
                  { id: "audio_convert" as const, label: "Extraer Audio a MP3", available: true },
                  { id: "extract_thumbnail" as const, label: "Extraer Miniatura PNG", available: !!isVideo },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    disabled={!act.available}
                    onClick={() => setJobType(act.id)}
                    className={`p-2.5 text-xs text-left rounded-xl border transition-all ${
                      jobType === act.id
                        ? "bg-purple-600/20 border-purple-500/50 text-white font-semibold shadow-sm"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                    } ${!act.available ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones de Compresión de Video */}
            {jobType === "video_compress" && (
              <div className="space-y-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Nivel de Compresión (CRF):</span>
                    <span className="font-mono font-bold text-purple-400">{crf} ({crf <= 20 ? "Alta Calidad" : crf <= 26 ? "Balanceado" : "Máxima Compresión"})</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="35"
                    value={crf}
                    onChange={(e) => setCrf(parseInt(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resolución</label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                    >
                      <option value="1080p">1080p Full HD</option>
                      <option value="720p">720p HD</option>
                      <option value="480p">480p SD</option>
                      <option value="original">Resolución Original</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Formato</label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                    >
                      <option value="mp4">MP4 (H.264 + AAC)</option>
                      <option value="webm">WebM (VP9 + Opus)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Opciones de Audio */}
            {jobType === "audio_convert" && (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                <label className="block text-[11px] text-slate-400">Bitrate de Audio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["128k", "192k", "320k"] as const).map((br) => (
                    <button
                      key={br}
                      type="button"
                      onClick={() => setAudioBitrate(br)}
                      className={`py-1.5 rounded-xl border text-xs font-mono font-semibold ${
                        audioBitrate === br ? "bg-purple-600/25 border-purple-500/50 text-white" : "border-white/10 text-slate-400"
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
              <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Despachar a Worker FFmpeg
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
