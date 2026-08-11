export interface CsvParseResult {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  errors: string[];
}

export interface ImageTransformOptions {
  brightness?: number; // -100 to 100 (default 0)
  contrast?: number;   // -100 to 100 (default 0)
  saturation?: number; // -100 to 100 (default 0)
  rotation?: number;   // 0, 90, 180, 270 degrees
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  resizeWidth?: number;
  resizeHeight?: number;
  outputFormat?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number; // 0.1 to 1.0
}

export interface DataConversionResult {
  content: string;
  sourceFormat: string;
  targetFormat: string;
  success: boolean;
  error?: string;
}
