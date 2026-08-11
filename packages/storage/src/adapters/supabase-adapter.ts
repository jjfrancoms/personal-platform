import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StorageProvider, StorageUploadResult } from "../types";

export interface SupabaseStorageConfig {
  url: string;
  key: string;
  bucket: string;
}

export class SupabaseStorageAdapter implements StorageProvider {
  private client: SupabaseClient;
  private bucket: string;

  constructor(config: SupabaseStorageConfig) {
    this.client = createClient(config.url, config.key);
    this.bucket = config.bucket;
  }

  async upload(
    fileBuffer: Buffer | Uint8Array,
    key: string,
    contentType: string
  ): Promise<StorageUploadResult> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(key);

    return {
      key,
      url: publicUrlData.publicUrl,
      sizeBytes: fileBuffer.length,
      mimeType: contentType,
      provider: "supabase",
    };
  }

  async getSignedUploadUrl(
    key: string,
    _contentType: string,
    _expiresInSeconds = 3600
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUploadUrl(key);

    if (error || !data) {
      throw new Error(`Failed to create Supabase signed upload URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async getSignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresInSeconds);

    if (error || !data) {
      throw new Error(`Failed to create Supabase signed download URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async delete(key: string): Promise<boolean> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([key]);

    return !error;
  }

  getPublicUrl(key: string): string {
    return this.client.storage.from(this.bucket).getPublicUrl(key).data.publicUrl;
  }
}
