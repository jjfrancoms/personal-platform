"use client";

import React, { useState, useRef } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { AssetFile } from "../../store/assetStore";
import { ThreeViewport } from "./three-viewport";

interface ModelViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetFile | null;
}

export const ModelViewerModal: React.FC<ModelViewerModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(1.0);
  const [lightColor, setLightColor] = useState("#38bdf8");
  const [envTheme, setEnvTheme] = useState<"void" | "studio" | "cyber">("studio");
  const [stats, setStats] = useState({ vertices: 0, triangles: 0, meshes: 0 });

  const viewportRef = useRef<{ getSnapshot: () => string } | null>(null);

  if (!isOpen || !asset) return null;

  const handleCaptureSnapshot = () => {
    if (!viewportRef.current) return;
    const dataUrl = viewportRef.current.getSnapshot();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `snapshot_${asset.name.replace(/\.[^/.]+$/, "")}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Icon name="project" size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">3D WebGL Studio: {asset.name}</h3>
                <p className="text-[10px] text-slate-400">
                  Three.js Hardware Accelerated Viewport • Orbit Drag & Zoom
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Main 3D Viewport Body */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            
            {/* 3D WebGL Canvas Viewport */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <ThreeViewport
                filename={asset.name}
                wireframe={wireframe}
                autoRotate={autoRotate}
                showGrid={showGrid}
                showAxes={showAxes}
                lightIntensity={lightIntensity}
                lightColor={lightColor}
                envTheme={envTheme}
                onStatsUpdate={setStats}
                viewportRef={viewportRef}
              />

              {/* Floating Mesh Stats Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-300 font-mono space-y-0.5 pointer-events-none">
                <p>Triangles: <span className="text-cyan-400 font-bold">{stats.triangles.toLocaleString()}</span></p>
                <p>Vertices: <span className="text-cyan-400 font-bold">{stats.vertices.toLocaleString()}</span></p>
                <p>Sub-Meshes: <span className="text-cyan-400 font-bold">{stats.meshes}</span></p>
              </div>

              {/* Navigation gesture hint */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-slate-400 pointer-events-none">
                Left Click Drag: Rotate • Wheel: Zoom
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full md:w-72 shrink-0 space-y-4 overflow-y-auto pr-1">
              
              {/* Display Modes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Display Options</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <GlassButton
                    type="button"
                    onClick={() => setWireframe(!wireframe)}
                    variant={wireframe ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1.5"
                  >
                    Wireframe
                  </GlassButton>
                  <GlassButton
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    variant={autoRotate ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1.5"
                  >
                    Auto Spin
                  </GlassButton>
                  <GlassButton
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    variant={showGrid ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1.5"
                  >
                    Ground Grid
                  </GlassButton>
                  <GlassButton
                    type="button"
                    onClick={() => setShowAxes(!showAxes)}
                    variant={showAxes ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1.5"
                  >
                    XYZ Axes
                  </GlassButton>
                </div>
              </div>

              {/* Lighting */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Lighting Studio</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Key Light Intensity</span>
                    <span className="font-mono text-cyan-400">{Math.round(lightIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={Math.round(lightIntensity * 100)}
                    onChange={(e) => setLightIntensity(parseInt(e.target.value) / 100)}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-400">Accent Point Light</p>
                  <div className="flex gap-2">
                    {[
                      { color: "#38bdf8", name: "Cyan" },
                      { color: "#ec4899", name: "Pink" },
                      { color: "#10b981", name: "Emerald" },
                      { color: "#ffffff", name: "White" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setLightColor(c.color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          lightColor === c.color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60"
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Environment Studio */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Environment</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["studio", "void", "cyber"] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setEnvTheme(env)}
                      className={`py-1 text-xs font-semibold rounded-lg border capitalize transition-all ${
                        envTheme === env
                          ? "bg-cyan-600/30 text-cyan-200 border-cyan-500/40"
                          : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Snapshot Action */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <GlassButton
                  onClick={handleCaptureSnapshot}
                  variant="primary"
                  size="sm"
                  className="w-full text-xs justify-center py-2"
                >
                  <Icon name="copy" size={13} />
                  Capture 2D Snapshot
                </GlassButton>
              </div>

            </div>

          </div>

        </GlassCard>
      </div>
    </div>
  );
};
