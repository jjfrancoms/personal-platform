import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageProvider, StorageUploadResult } from "../types";

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicDomain?: string;
}

export class CloudflareR2Adapter implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicDomain?: string;

  constructor(config: R2StorageConfig) {
    this.bucket = config.bucket;
    this.publicDomain = config.publicDomain;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(
    fileBuffer: Buffer | Uint8Array,
    key: string,
    contentType: string
  ): Promise<StorageUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.client.send(command);

    return {
      key,
      url: this.getPublicUrl(key),
      sizeBytes: fileBuffer.length,
      mimeType: contentType,
      provider: "cloudflare_r2",
    };
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getSignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async delete(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    if (this.publicDomain) {
      const cleanDomain = this.publicDomain.replace(/\/$/, "");
      return `${cleanDomain}/${key}`;
    }
    return `https://${this.bucket}.r2.dev/${key}`;
  }

  async getBucketMetrics(): Promise<{
    objectCount: number;
    totalSizeBytes: number;
    bucketName: string;
    status: "online" | "error";
    error?: string;
  }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1000,
      });
      const response = await this.client.send(command);
      const objects = response.Contents || [];
      const totalSizeBytes = objects.reduce((acc, obj) => acc + (obj.Size || 0), 0);
      return {
        objectCount: objects.length,
        totalSizeBytes,
        bucketName: this.bucket,
        status: "online",
      };
    } catch (err: any) {
      return {
        objectCount: 0,
        totalSizeBytes: 0,
        bucketName: this.bucket,
        status: "error",
        error: err?.message,
      };
    }
  }
}
