"use client";

import React, { useState } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";

interface ModJarViewerProps {
  filename: string;
}

export const ModJarViewer: React.FC<ModJarViewerProps> = ({ filename }) => {
  const isSchematic = filename.match(/\.(schematic|schem)$/i);

  const modData = {
    modId: "custom_swords_mod",
    name: "Custom Swords & Armory Expansion",
    version: "2.4.1",
    loader: "fabric",
    mcVersion: ">=1.20.4 <=1.21.1",
    description: "Adds 12 high-tier elemental swords, custom particles, and Netherite forging enhancements.",
    authors: ["JuanDev", "MojangCommunity"],
    license: "MIT",
    dependencies: [
      { id: "minecraft", versionRange: ">=1.20.4" },
      { id: "fabricloader", versionRange: ">=0.15.0" },
      { id: "fabric-api", versionRange: "*" },
    ],
    mixins: ["custom_swords.mixins.json", "custom_swords.client.mixins.json"],
  };

  const schematicData = {
    name: filename,
    format: "Sponge Schematic v2",
    dimensions: { width: 45, height: 28, length: 60 },
    totalBlocks: 75600,
    paletteEntities: 12,
    tileEntities: 84,
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold">
            <Icon name="folder" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white leading-none">
                {isSchematic ? schematicData.name : modData.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold uppercase text-[10px] border border-orange-500/30">
                {isSchematic ? "SCHEMATIC" : "FABRIC MOD"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSchematic ? "WorldEdit / Sponge Voxel Map" : `Mod ID: ${modData.modId} • v${modData.version}`}
            </p>
          </div>
        </div>

        <GlassButton
          onClick={() => alert(`Downloading binary package: ${filename}`)}
          variant="primary"
          size="sm"
          className="text-xs py-1"
        >
          Download JAR
        </GlassButton>
      </div>

      {/* Main Details Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {isSchematic ? (
          /* Schematic Voxel Dimensions Card */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Bounding Dimensions</p>
              <p className="text-lg font-bold text-white">
                {schematicData.dimensions.width} x {schematicData.dimensions.height} x {schematicData.dimensions.length}
              </p>
              <p className="text-xs text-slate-500">Width x Height x Length</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Voxel Volume</p>
              <p className="text-lg font-bold text-cyan-400">{schematicData.totalBlocks.toLocaleString()} blocks</p>
              <p className="text-xs text-slate-500">{schematicData.tileEntities} Tile Entities</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Format Version</p>
              <p className="text-lg font-bold text-white">{schematicData.format}</p>
              <p className="text-xs text-slate-500">WorldEdit 7.x Compatible</p>
            </div>
          </div>
        ) : (
          /* Mod JAR Manifest details */
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{modData.description}</p>
              <div className="flex gap-4 pt-2 text-xs text-slate-400 border-t border-white/5">
                <p><strong>Minecraft Target:</strong> {modData.mcVersion}</p>
                <p><strong>Authors:</strong> {modData.authors.join(", ")}</p>
                <p><strong>License:</strong> {modData.license}</p>
              </div>
            </div>

            {/* Dependencies */}
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dependencies</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {modData.dependencies.map((dep) => (
                  <div key={dep.id} className="p-2 bg-slate-900/60 rounded-lg border border-white/5 text-xs font-mono">
                    <p className="font-bold text-white">{dep.id}</p>
                    <p className="text-[10px] text-cyan-400">{dep.versionRange}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mixins */}
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mixins Configured</h4>
              <div className="flex gap-2 flex-wrap">
                {modData.mixins.map((mx) => (
                  <span key={mx} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                    {mx}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
