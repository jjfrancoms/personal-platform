export * from "./types";
export * from "./security";
export * from "./adapters/supabase-adapter";
export * from "./adapters/r2-adapter";

import { StorageProvider } from "./types";
import { SupabaseStorageAdapter, SupabaseStorageConfig } from "./adapters/supabase-adapter";
import { CloudflareR2Adapter, R2StorageConfig } from "./adapters/r2-adapter";

export type StorageFactoryConfig =
  | ({ provider: "supabase" } & SupabaseStorageConfig)
  | ({ provider: "cloudflare_r2" } & R2StorageConfig);

export function createStorageProvider(config: StorageFactoryConfig): StorageProvider {
  if (config.provider === "supabase") {
    return new SupabaseStorageAdapter(config);
  }
  return new CloudflareR2Adapter(config);
}
