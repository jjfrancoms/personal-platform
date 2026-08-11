import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSafeStorageKey, validateMagicNumbers } from "@personal-platform/storage";

export interface AssetVersionItem {
  id: string;
  versionNumber: number;
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
  changeSummary: string;
  createdAt: string;
}

export interface AssetFile {
  id: string;
  name: string;
  storageKey: string;
  storageProvider: "supabase" | "cloudflare_r2";
  mimeType: string;
  sizeBytes: number;
  isPrivate: boolean;
  projectId: string;
  folderId?: string;
  currentVersion: number;
  versions: AssetVersionItem[];
  createdAt: string;
  updatedAt: string;
}

interface AssetState {
  assets: AssetFile[];
  uploadingFiles: { id: string; name: string; progress: number }[];

  // Actions
  uploadAsset: (params: {
    projectId: string;
    file: { name: string; size: number; type: string; buffer?: Uint8Array };
    folderId?: string;
    isPrivate?: boolean;
    provider?: "supabase" | "cloudflare_r2";
  }) => Promise<AssetFile>;

  uploadNewVersion: (params: {
    assetId: string;
    file: { name: string; size: number; type: string; buffer?: Uint8Array };
    changeSummary: string;
  }) => Promise<void>;

  deleteAsset: (id: string) => void;
  getProjectAssets: (projectId: string) => AssetFile[];
}

const DEFAULT_ASSETS: AssetFile[] = [
  {
    id: "asset-1",
    name: "steve_skin_hd.png",
    storageKey: "assets/3f8b1a20-minecraft-skin.png",
    storageProvider: "supabase",
    mimeType: "image/png",
    sizeBytes: 131072, // 128 KB
    isPrivate: false,
    projectId: "proj-1",
    currentVersion: 1,
    versions: [
      {
        id: "ver-1",
        versionNumber: 1,
        storageKey: "assets/3f8b1a20-minecraft-skin.png",
        sizeBytes: 131072,
        mimeType: "image/png",
        changeSummary: "Initial HD skin texture upload",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "asset-2",
    name: "custom_swords_mod.jar",
    storageKey: "assets/8e9a2b10-swords-mod.jar",
    storageProvider: "supabase",
    mimeType: "application/java-archive",
    sizeBytes: 4404019, // 4.2 MB
    isPrivate: true,
    projectId: "proj-1",
    currentVersion: 2,
    versions: [
      {
        id: "ver-2-1",
        versionNumber: 1,
        storageKey: "assets/8e9a2b10-swords-mod-v1.jar",
        sizeBytes: 3800000,
        mimeType: "application/java-archive",
        changeSummary: "Beta build 1.0.0",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "ver-2-2",
        versionNumber: 2,
        storageKey: "assets/8e9a2b10-swords-mod.jar",
        sizeBytes: 4404019,
        mimeType: "application/java-archive",
        changeSummary: "Fixed damage multipliers & particle effects",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "asset-3",
    name: "player_model.bbmodel",
    storageKey: "assets/7c4f1e99-player-model.bbmodel",
    storageProvider: "supabase",
    mimeType: "application/json",
    sizeBytes: 327680, // 320 KB
    isPrivate: false,
    projectId: "proj-1",
    currentVersion: 1,
    versions: [
      {
        id: "ver-3",
        versionNumber: 1,
        storageKey: "assets/7c4f1e99-player-model.bbmodel",
        sizeBytes: 327680,
        mimeType: "application/json",
        changeSummary: "Blockbench 3D bone structure",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "asset-4",
    name: "cyber_car_lowpoly.glb",
    storageKey: "assets/9a1b2c3d-cyber-car.glb",
    storageProvider: "cloudflare_r2",
    mimeType: "model/gltf-binary",
    sizeBytes: 8808038, // 8.4 MB
    isPrivate: false,
    projectId: "proj-2",
    currentVersion: 1,
    versions: [
      {
        id: "ver-4",
        versionNumber: 1,
        storageKey: "assets/9a1b2c3d-cyber-car.glb",
        sizeBytes: 8808038,
        mimeType: "model/gltf-binary",
        changeSummary: "Exported GLTF 2.0 with PBR textures",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: DEFAULT_ASSETS,
      uploadingFiles: [],

      uploadAsset: async ({ projectId, file, folderId, isPrivate = false, provider = "supabase" }) => {
        const uploadId = `upl-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          uploadingFiles: [...state.uploadingFiles, { id: uploadId, name: file.name, progress: 10 }],
        }));

        // Binary signature validation if buffer present
        if (file.buffer) {
          validateMagicNumbers(file.buffer);
        }

        // Simulate chunked upload progress
        await new Promise((r) => setTimeout(r, 200));
        set((state) => ({
          uploadingFiles: state.uploadingFiles.map((u) => (u.id === uploadId ? { ...u, progress: 60 } : u)),
        }));

        await new Promise((r) => setTimeout(r, 300));
        set((state) => ({
          uploadingFiles: state.uploadingFiles.map((u) => (u.id === uploadId ? { ...u, progress: 100 } : u)),
        }));

        const safeKey = generateSafeStorageKey(file.name);
        const newAsset: AssetFile = {
          id: `asset-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          storageKey: safeKey,
          storageProvider: provider,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          isPrivate,
          projectId,
          folderId,
          currentVersion: 1,
          versions: [
            {
              id: `ver-${Math.random().toString(36).substr(2, 9)}`,
              versionNumber: 1,
              storageKey: safeKey,
              sizeBytes: file.size,
              mimeType: file.type || "application/octet-stream",
              changeSummary: "Initial version upload",
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          assets: [newAsset, ...state.assets],
          uploadingFiles: state.uploadingFiles.filter((u) => u.id !== uploadId),
        }));

        return newAsset;
      },

      uploadNewVersion: async ({ assetId, file, changeSummary }) => {
        const asset = get().assets.find((a) => a.id === assetId);
        if (!asset) return;

        const nextVersionNumber = asset.currentVersion + 1;
        const safeKey = generateSafeStorageKey(file.name, `assets/v${nextVersionNumber}`);

        const newVersion: AssetVersionItem = {
          id: `ver-${Math.random().toString(36).substr(2, 9)}`,
          versionNumber: nextVersionNumber,
          storageKey: safeKey,
          sizeBytes: file.size,
          mimeType: file.type || asset.mimeType,
          changeSummary: changeSummary || `Updated to revision ${nextVersionNumber}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  sizeBytes: file.size,
                  storageKey: safeKey,
                  currentVersion: nextVersionNumber,
                  versions: [newVersion, ...a.versions],
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));
      },

      getProjectAssets: (projectId) => {
        return get().assets.filter((a) => a.projectId === projectId);
      },
    }),
    {
      name: "personal-platform-assets",
    }
  )
);
