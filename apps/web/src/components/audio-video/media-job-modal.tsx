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
    let outputName = `${baseName}_compressed.mp4`;

    if (jobType === "video_to_gif") {
      outputName = `${baseName}_animation.gif`;
    } else if (jobType === "audio_convert") {
      outputName = `${baseName}_audio.mp3`;
    } else if (jobType === "extract_thumbnail") {
      outputName = `${baseName}_thumb.png`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-600/30 border border-pink-500/30 flex items-center justify-center text-pink-300">
                <Icon name="settings" size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">FFmpeg Media Pipeline</h3>
                <p className="text-[10px] text-slate-400">Target Asset: {asset.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <Icon name="close" size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pipeline Action Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Processing Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "video_compress" as const, label: "Compress Video (H.264)", available: !!isVideo },
                  { id: "video_to_gif" as const, label: "Convert to Animated GIF", available: !!isVideo },
                  { id: "audio_convert" as const, label: "Extract / Transcode MP3", available: true },
                  { id: "extract_thumbnail" as const, label: "Extract Video Thumbnail", available: !!isVideo },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    disabled={!act.available}
                    onClick={() => setJobType(act.id)}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-all ${
                      jobType === act.id
                        ? "bg-pink-600/25 text-pink-200 border-pink-500/40 shadow-sm"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Compression parameters */}
            {jobType === "video_compress" && (
              <>
                {/* Resolution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Target Resolution</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["1080p", "720p", "480p", "original"] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setResolution(res)}
                        className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                          resolution === res
                            ? "bg-blue-600/30 text-white border-blue-500/50"
                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider (CRF) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Compression Level (CRF)</span>
                    <span className="font-mono text-cyan-400">CRF {crf} {crf > 26 ? "(Max Compact)" : crf < 20 ? "(High Fidelity)" : "(Balanced)"}</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="30"
                    value={crf}
                    onChange={(e) => setCrf(parseInt(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Audio settings */}
            {jobType === "audio_convert" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Audio Bitrate</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["320k", "192k", "128k"] as const).map((bitrate) => (
                    <button
                      key={bitrate}
                      type="button"
                      onClick={() => setAudioBitrate(bitrate)}
                      className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                        audioBitrate === bitrate
                          ? "bg-blue-600/30 text-white border-blue-500/50"
                          : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {bitrate}ps
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <GlassButton type="button" onClick={onClose} variant="ghost" size="sm">
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" size="sm">
                Queue Worker Job
              </GlassButton>
            </div>
          </form>

        </GlassCard>
      </div>
    </div>
  );
};
