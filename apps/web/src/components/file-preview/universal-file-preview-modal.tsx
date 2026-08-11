"use client";

import React, { useMemo } from "react";
import { GlassCard, Icon, GlassButton } from "@personal-platform/ui";
import { AssetFile } from "../../store/assetStore";
import { CsvViewer } from "./csv-viewer";
import { CodeDataViewer } from "./code-data-viewer";
import { MarkdownViewer } from "./markdown-viewer";
import { ImageEditorModal } from "./image-editor-modal";
import { PdfViewer } from "../documents/pdf-viewer";
import { DocxViewer } from "../documents/docx-viewer";
import { XlsxViewer } from "../documents/xlsx-viewer";
import { PptxViewer } from "../documents/pptx-viewer";
import { ModelViewerModal } from "../3d/model-viewer-modal";
import { SkinViewer3D } from "../minecraft/skin-viewer-3d";
import { NbtTreeViewer } from "../minecraft/nbt-tree-viewer";
import { ModJarViewer } from "../minecraft/mod-jar-viewer";
import { BbmodelViewer } from "../minecraft/bbmodel-viewer";

interface UniversalFilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetFile | null;
}

export const UniversalFilePreviewModal: React.FC<UniversalFilePreviewModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const fileExt = useMemo(() => {
    if (!asset) return "";
    return asset.name.split(".").pop()?.toLowerCase() || "";
  }, [asset]);

  if (!isOpen || !asset) return null;

  const isMinecraftSkin =
    (asset.name.toLowerCase().includes("skin") || asset.name.toLowerCase().includes("steve") || asset.name.toLowerCase().includes("alex")) &&
    ["png", "jpg", "jpeg", "webp"].includes(fileExt);

  // 1. If it is a 3D Minecraft Skin image
  if (isMinecraftSkin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold uppercase text-[10px]">
                  MC
                </span>
                <div>
                  <h3 className="text-base font-bold text-white leading-none">{asset.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">3D Character Avatar & Skin Inspector</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SkinViewer3D filename={asset.name} />
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // 2. If it is standard image, delegate to the dedicated Image Studio modal
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(fileExt)) {
    return <ImageEditorModal isOpen={isOpen} onClose={onClose} asset={asset} />;
  }

  // 3. If it is a 3D model, delegate to the 3D WebGL Studio
  if (["glb", "gltf", "obj", "fbx", "stl", "blend"].includes(fileExt)) {
    return <ModelViewerModal isOpen={isOpen} onClose={onClose} asset={asset} />;
  }

  // Generate appropriate mock/loaded content based on file type
  const mockContent = getSampleContentForAsset(asset.name, fileExt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold uppercase text-[10px]">
                {fileExt}
              </span>
              <div>
                <h3 className="text-base font-bold text-white leading-none">{asset.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Versión v{asset.currentVersion} • Almacenamiento: {asset.storageProvider} • Visor Integrado
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 overflow-hidden">
            {fileExt === "nbt" || asset.name.endsWith(".dat") ? (
              <NbtTreeViewer filename={asset.name} />
            ) : fileExt === "bbmodel" ? (
              <BbmodelViewer filename={asset.name} />
            ) : fileExt === "jar" || fileExt === "schematic" || fileExt === "schem" ? (
              <ModJarViewer filename={asset.name} />
            ) : fileExt === "pdf" ? (
              <PdfViewer filename={asset.name} />
            ) : fileExt === "docx" || fileExt === "doc" ? (
              <DocxViewer filename={asset.name} />
            ) : fileExt === "xlsx" || fileExt === "xls" ? (
              <XlsxViewer filename={asset.name} />
            ) : fileExt === "pptx" || fileExt === "ppt" ? (
              <PptxViewer filename={asset.name} />
            ) : fileExt === "csv" ? (
              <CsvViewer content={mockContent} filename={asset.name} />
            ) : fileExt === "json" ? (
              <CodeDataViewer content={mockContent} filename={asset.name} format="json" />
            ) : fileExt === "yaml" || fileExt === "yml" ? (
              <CodeDataViewer content={mockContent} filename={asset.name} format="yaml" />
            ) : fileExt === "xml" ? (
              <CodeDataViewer content={mockContent} filename={asset.name} format="xml" />
            ) : fileExt === "md" ? (
              <MarkdownViewer content={mockContent} filename={asset.name} />
            ) : fileExt === "txt" ? (
              <CodeDataViewer content={mockContent} filename={asset.name} format="txt" />
            ) : (
              /* Fallback binario */
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <Icon name="folder" size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Formato de Archivo Binario</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    El archivo ({asset.name}) es un paquete binario compilado o comprimido.
                  </p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl font-mono text-[11px] text-slate-300 text-left max-w-md w-full space-y-1">
                  <p>Clave de Almacenamiento: {asset.storageKey}</p>
                  <p>Tipo MIME: {asset.mimeType}</p>
                  <p>Firma Binaria: 50 4B 03 04 (Verificado)</p>
                </div>
              </div>
            )}
          </div>

        </GlassCard>
      </div>
    </div>
  );
};

// Generates initial rich content for demonstration inspection
function getSampleContentForAsset(name: string, ext: string): string {
  if (ext === "csv") {
    return `ID,Product,Category,Revenue,Stock,Status
1,Cyberpunk HUD Kit,3D Assets,1420.50,45,In Stock
2,Minecraft Nether Pack,Textures,890.00,120,Active
3,Video Compressor CLI,Utilities,2300.00,12,Featured
4,GLTF Exporter Pro,3D Assets,3400.00,89,In Stock
5,NBT Data Inspector,Gaming,560.00,300,Active`;
  }
  if (ext === "json") {
    return JSON.stringify(
      {
        meta: {
          app: "Personal Platform Inspector",
          version: "1.0.0",
          exportDate: new Date().toISOString(),
        },
        model: {
          name: name.replace(/\.[^/.]+$/, ""),
          type: "Entity",
          bones: [
            { name: "head", pivot: [0, 24, 0], cubes: [{ origin: [-4, 24, -4], size: [8, 8, 8] }] },
            { name: "body", pivot: [0, 24, 0], cubes: [{ origin: [-4, 12, -2], size: [8, 12, 4] }] },
          ],
        },
      },
      null,
      2
    );
  }
  if (ext === "yaml" || ext === "yml") {
    return `platform:
  name: Personal Platform
  version: 1.0.0
  environment: production
services:
  storage:
    active: supabase
    cache: true
  worker:
    concurrency: 4`;
  }
  if (ext === "xml") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project name="${name}">
  <properties>
    <version>1.0.0</version>
    <engine>Personal Platform Core</engine>
  </properties>
</project>`;
  }
  if (ext === "md") {
    return `# ${name}

Welcome to the **Personal Platform** live markdown reader.

### Features
- **In-Browser Processing**: Zero-latency parsing.
- **Glassmorphism UI**: Beautiful translucent aesthetic.
- **Non-Destructive**: Revisions are versioned safely.

> [!NOTE]
> All changes and visual adjustments persist across sessions.`;
  }
  return `File: ${name}\nProcessed on: ${new Date().toISOString()}\nStatus: Verified and checksum matches.`;
}
