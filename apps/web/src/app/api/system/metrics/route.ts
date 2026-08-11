import { NextResponse } from "next/server";
import { CloudflareR2Adapter } from "@personal-platform/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i]}`;
}

export async function GET() {
  const r2AccountId = process.env.R2_ACCOUNT_ID || "2ef4ba6489596a9004db1e06de3b9e4d";
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || "3ee93f08316611e843d4b0ae0edb01ae";
  const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "4ec1093a6802fb16327464018d83be9baa0d59d5601ca571d2d38aed7b2dfc07";
  const r2BucketName = process.env.R2_BUCKET_NAME || "personal-platform-assets";
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8080";

  // 1. KPI 1: Real Cloudflare R2 Storage Metrics
  let storageData = {
    usedBytes: 0,
    usedFormatted: "0 B",
    quotaBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    quotaFormatted: "10 GB",
    percentage: 0,
    fileCount: 0,
    provider: "Cloudflare R2 + Supabase",
    bucketName: r2BucketName,
    isOnline: true,
    statusText: "Cloudflare R2 Conectado",
  };

  try {
    const r2 = new CloudflareR2Adapter({
      accountId: r2AccountId,
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
      bucket: r2BucketName,
    });

    const metrics = await r2.getBucketMetrics();
    const usedBytes = metrics.totalSizeBytes;
    const quotaBytes = 10 * 1024 * 1024 * 1024; // 10 GB Standard Free Tier
    const percentage = Math.min(100, Math.max(0, Math.round((usedBytes / quotaBytes) * 100)));

    storageData = {
      usedBytes,
      usedFormatted: formatBytes(usedBytes),
      quotaBytes,
      quotaFormatted: "10 GB",
      percentage: percentage === 0 && usedBytes > 0 ? 1 : percentage,
      fileCount: metrics.objectCount,
      provider: "Cloudflare R2 + Supabase",
      bucketName: r2BucketName,
      isOnline: metrics.status === "online",
      statusText: metrics.status === "online" ? `R2 Activo • Bucket: ${r2BucketName}` : "Error de Conexión R2",
    };
  } catch (err: any) {
    storageData.isOnline = false;
    storageData.statusText = "R2 en espera de sincronización";
  }

  // 2. KPI 2: Real Heavy Worker Service Telemetry
  let workerData = {
    isOnline: false,
    service: "FFmpeg Worker",
    statusLabel: "Worker Desconectado",
    cpuCores: 4,
    cpuLabel: "Servicio Worker Offline",
    activeJobs: 0,
    uptimeFormatted: "0m",
    gaugePercentage: 0,
    memoryUsageMB: 0,
    platform: "Node.js",
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const workerRes = await fetch(`${workerUrl}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (workerRes.ok) {
      const data = await workerRes.json();
      const cpuCount = data.cpuCores || 4;

      workerData = {
        isOnline: true,
        service: "FFmpeg 2026",
        statusLabel: "FFmpeg Listo",
        cpuCores: cpuCount,
        cpuLabel: `${cpuCount} Nodos CPU • Listo`,
        activeJobs: data.activeJobs || 0,
        uptimeFormatted: data.uptimeFormatted || `${Math.floor(data.uptimeSeconds / 60)}m`,
        gaugePercentage: 100,
        memoryUsageMB: data.memory?.usedMB || 0,
        platform: data.platform || "Node.js",
      };
    }
  } catch {
    workerData.isOnline = false;
    workerData.statusLabel = "Worker Inactivo";
    workerData.cpuLabel = "Inicia el worker en :8080";
  }

  return NextResponse.json({
    storage: storageData,
    worker: workerData,
    timestamp: new Date().toISOString(),
  });
}
