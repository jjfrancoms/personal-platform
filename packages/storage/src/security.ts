export interface BinarySignature {
  mime: string;
  ext: string;
  bytes: number[];
  offset?: number;
}

export const KNOWN_SIGNATURES: BinarySignature[] = [
  { mime: "image/png", ext: ".png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/jpeg", ext: ".jpg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", ext: ".gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "application/pdf", ext: ".pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "application/zip", ext: ".zip", bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK.. (ZIP, JAR, DOCX, XLSX)
  { mime: "model/gltf-binary", ext: ".glb", bytes: [0x67, 0x6c, 0x54, 0x46] }, // glTF binary
];

/**
 * Validates a file buffer against known magic numbers (binary signatures)
 */
export function validateMagicNumbers(buffer: Uint8Array): { isValid: boolean; detectedMime?: string } {
  for (const sig of KNOWN_SIGNATURES) {
    const offset = sig.offset || 0;
    if (buffer.length >= offset + sig.bytes.length) {
      const match = sig.bytes.every((b, i) => buffer[offset + i] === b);
      if (match) {
        return { isValid: true, detectedMime: sig.mime };
      }
    }
  }
  return { isValid: true }; // Allow text and structured files if non-binary
}

/**
 * Sanitizes SVG code to eliminate malicious embedded scripts, iframes, or event handlers
 */
export function sanitizeSvg(svgContent: string): string {
  return svgContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "")
    .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, "");
}

/**
 * Generates a safe storage key using UUID v4 and the original extension,
 * preventing path traversal vulnerabilities and keeping the storage backend clean.
 */
export function generateSafeStorageKey(originalName: string, prefix = "assets"): string {
  // Strip path traversal attempts
  const cleanedName = originalName.replace(/^.*[\\\/]/, "").replace(/\0/g, "");
  const extension = cleanedName.includes(".") ? `.${cleanedName.split(".").pop()?.toLowerCase()}` : "";
  
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  return `${prefix}/${uuid}${extension}`;
}
