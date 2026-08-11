import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StorageConfig {
  provider: "supabase" | "cloudflare_r2" | "local";
  supabaseBucket: string;
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicDomain: string;
  maxFileSizeMb: number;
  allowedExtensions: string[];
}

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  databaseUrl: string;
  connectionStatus: "connected" | "disconnected" | "checking";
}

export interface WorkerConfig {
  workerEndpoint: string;
  maxConcurrentJobs: number;
  enableFfmpegHardwareAccel: boolean;
  autoGenerateThumbnails: boolean;
  workerStatus: "online" | "offline" | "idle";
}

export interface IntegrationsConfig {
  webhookUrl: string;
  openAiApiKey: string;
  githubToken: string;
}

export interface AppearanceConfig {
  themeMode: "dark" | "glass-neon" | "midnight";
  defaultProjectLayout: "grid" | "list";
  autoSoftDeleteRetentionDays: number;
  glassBlurLevel: "light" | "medium" | "heavy";
}

export interface PlatformSettingsState {
  storage: StorageConfig;
  database: DatabaseConfig;
  worker: WorkerConfig;
  integrations: IntegrationsConfig;
  appearance: AppearanceConfig;

  // Actions
  updateStorage: (updates: Partial<StorageConfig>) => void;
  updateDatabase: (updates: Partial<DatabaseConfig>) => void;
  updateWorker: (updates: Partial<WorkerConfig>) => void;
  updateIntegrations: (updates: Partial<IntegrationsConfig>) => void;
  updateAppearance: (updates: Partial<AppearanceConfig>) => void;
  testConnection: () => Promise<boolean>;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  storage: {
    provider: "supabase" as const,
    supabaseBucket: "personal-platform-assets",
    r2AccountId: "",
    r2AccessKeyId: "",
    r2SecretAccessKey: "",
    r2BucketName: "personal-platform-r2",
    r2PublicDomain: "https://cdn.personal-platform.dev",
    maxFileSizeMb: 500,
    allowedExtensions: [
      ".png", ".jpg", ".jpeg", ".svg", ".webp",
      ".mp4", ".mov", ".webm", ".mp3", ".wav",
      ".json", ".xml", ".csv", ".yaml", ".md", ".txt",
      ".pdf", ".docx", ".xlsx",
      ".glb", ".gltf", ".obj", ".fbx", ".stl",
      ".bbmodel", ".nbt", ".schematic", ".jar", ".zip"
    ],
  },
  database: {
    supabaseUrl: "https://xyzcompany.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    supabaseServiceRoleKey: "",
    databaseUrl: "postgresql://postgres:password@localhost:5432/personal_platform",
    connectionStatus: "connected" as const,
  },
  worker: {
    workerEndpoint: "http://localhost:8080",
    maxConcurrentJobs: 4,
    enableFfmpegHardwareAccel: true,
    autoGenerateThumbnails: true,
    workerStatus: "idle" as const,
  },
  integrations: {
    webhookUrl: "",
    openAiApiKey: "",
    githubToken: "",
  },
  appearance: {
    themeMode: "glass-neon" as const,
    defaultProjectLayout: "grid" as const,
    autoSoftDeleteRetentionDays: 30,
    glassBlurLevel: "medium" as const,
  },
};

export const useSettingsStore = create<PlatformSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      updateStorage: (updates) =>
        set((state) => ({ storage: { ...state.storage, ...updates } })),

      updateDatabase: (updates) =>
        set((state) => ({ database: { ...state.database, ...updates } })),

      updateWorker: (updates) =>
        set((state) => ({ worker: { ...state.worker, ...updates } })),

      updateIntegrations: (updates) =>
        set((state) => ({ integrations: { ...state.integrations, ...updates } })),

      updateAppearance: (updates) =>
        set((state) => ({ appearance: { ...state.appearance, ...updates } })),

      testConnection: async () => {
        set((state) => ({
          database: { ...state.database, connectionStatus: "checking" },
        }));
        await new Promise((resolve) => setTimeout(resolve, 800));
        set((state) => ({
          database: { ...state.database, connectionStatus: "connected" },
        }));
        return true;
      },

      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "personal-platform-settings",
    }
  )
);
