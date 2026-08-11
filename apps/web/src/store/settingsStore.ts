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
    provider: "cloudflare_r2" as const,
    supabaseBucket: "assets",
    r2AccountId: "2ef4ba6489596a9004db1e06de3b9e4d",
    r2AccessKeyId: "3ee93f08316611e843d4b0ae0edb01ae",
    r2SecretAccessKey: "4ec1093a6802fb16327464018d83be9baa0d59d5601ca571d2d38aed7b2dfc07",
    r2BucketName: "personal-platform-assets",
    r2PublicDomain: "https://pub-2ef4ba6489596a9004db1e06de3b9e4d.r2.dev",
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
    supabaseUrl: "https://wyqzvypfjeivjuxqbkwd.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cXp2eXBmamVpdmp1eHFia3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTc5NTcsImV4cCI6MjEwMjAzMzk1N30.l9X9tCxv5hMoq9kpd34WfgPnNFpl2MDCc9hH3he-uh4",
    supabaseServiceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cXp2eXBmamVpdmp1eHFia3dkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ1Nzk1NywiZXhwIjoyMTAyMDMzOTU3fQ.AYiu1HCxhhNyuCKnWHMKte8gMD-n1BnUZ32aQvibiOU",
    databaseUrl: "postgresql://postgres.wyqzvypfjeivjuxqbkwd:Bi4Jlrn2cs26Jwi8@aws-0-us-east-2.pooler.supabase.com:6543/postgres",
    connectionStatus: "connected" as const,
  },
  worker: {
    workerEndpoint: "http://localhost:8080",
    maxConcurrentJobs: 4,
    enableFfmpegHardwareAccel: true,
    autoGenerateThumbnails: true,
    workerStatus: "online" as const,
  },
  integrations: {
    webhookUrl: "",
    openAiApiKey: "",
    githubToken: "github_pat_jjfrancoms",
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
