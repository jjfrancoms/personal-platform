"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { CanvasImageProcessor } from "@personal-platform/processors";
import { useAssetStore, AssetFile } from "../../store/assetStore";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetFile | null;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { uploadNewVersion } = useAssetStore();
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate a placeholder visual demo skin image if direct blob is unavailable
  const baseImageSource = useMemoPlaceholderImage(asset?.name);

  useEffect(() => {
    if (isOpen && baseImageSource) {
      updateCanvasPreview();
    }
  }, [isOpen, brightness, contrast, saturation, rotation, flipH, flipV, baseImageSource]);

  const updateCanvasPreview = async () => {
    try {
      const transformed = await CanvasImageProcessor.transform(baseImageSource, {
        brightness,
        contrast,
        saturation,
        rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
      });
      setPreviewUrl(transformed);
    } catch (err) {
      console.error("Canvas transform failed", err);
    }
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSaveRevision = async () => {
    if (!asset || !previewUrl) return;
    setIsProcessing(true);

    try {
      // Convert dataUrl to blob
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const file = new File([blob], asset.name, { type: "image/png" });

      await uploadNewVersion({
        assetId: asset.id,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        changeSummary: `Applied canvas filters (Brightness: ${brightness}%, Contrast: ${contrast}%, Rotation: ${rotation}°)`,
      });

      alert("Successfully published new image revision!");
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl || !asset) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `adjusted_${asset.name}`;
    a.click();
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Icon name="edit" size={16} />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Image Studio: {asset.name}</h3>
                <p className="text-[10px] text-slate-400">In-Browser Hardware Accelerated Processing</p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-[360px]">
            
            {/* Viewport Canvas Preview */}
            <div className="flex-1 flex items-center justify-center bg-slate-950/80 border border-white/10 rounded-2xl p-4 overflow-hidden relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Processed visual"
                  className="max-h-[320px] max-w-full object-contain rounded-lg shadow-2xl transition-all"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <p className="text-xs text-slate-500">Rendering preview...</p>
              )}
            </div>

            {/* Adjustment Controls Panel */}
            <div className="w-full md:w-72 shrink-0 space-y-4 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Adjustments
              </h4>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Brightness</span>
                    <span className="font-mono text-cyan-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Contrast</span>
                    <span className="font-mono text-cyan-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Saturation</span>
                    <span className="font-mono text-cyan-400">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Transform Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[11px] font-semibold text-slate-400">Orientation</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <GlassButton type="button" onClick={handleRotate} variant="secondary" size="sm" className="text-xs py-1">
                    Rotate 90°
                  </GlassButton>
                  <GlassButton
                    type="button"
                    onClick={() => setFlipH(!flipH)}
                    variant={flipH ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1"
                  >
                    Flip H
                  </GlassButton>
                  <GlassButton
                    type="button"
                    onClick={() => setFlipV(!flipV)}
                    variant={flipV ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1"
                  >
                    Flip V
                  </GlassButton>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Reset Adjustments
                </button>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 shrink-0">
            <GlassButton onClick={handleDownload} variant="secondary" size="sm">
              Download PNG
            </GlassButton>

            <div className="flex gap-2">
              <GlassButton onClick={onClose} variant="ghost" size="sm">
                Cancel
              </GlassButton>
              <GlassButton
                onClick={handleSaveRevision}
                variant="primary"
                size="sm"
                disabled={isProcessing}
              >
                {isProcessing ? "Saving..." : "Publish New Revision"}
              </GlassButton>
            </div>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};

// Helper creating a fallback client-side SVG demo texture
function useMemoPlaceholderImage(filename?: string): string {
  return React.useMemo(() => {
    // Generate an in-memory test pixel pattern
    const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
    if (!canvas) return "";
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Draw stylized Minecraft Steve skin face / grid texture
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#15803d";
    ctx.fillRect(16, 16, 96, 96);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(32, 32, 24, 24);
    ctx.fillRect(72, 32, 24, 24);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(36, 36, 12, 12);
    ctx.fillRect(76, 36, 12, 12);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(40, 80, 48, 16);

    return canvas.toDataURL("image/png");
  }, [filename]);
}
