export interface StorageUploadResult {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  provider: "supabase" | "cloudflare_r2";
}

export interface StorageProvider {
  upload(
    fileBuffer: Buffer | Uint8Array,
    key: string,
    contentType: string
  ): Promise<StorageUploadResult>;
  getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number
  ): Promise<string>;
  getSignedDownloadUrl(
    key: string,
    expiresInSeconds?: number
  ): Promise<string>;
  delete(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
}
