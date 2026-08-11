import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export interface DocumentConvertOptions {
  inputPath: string;
  outputDirectory: string;
  targetFormat?: "pdf" | "html" | "txt";
}

export class DocumentConverter {
  /**
   * Converts Office documents (DOCX, XLSX, PPTX) to PDF using LibreOffice in the headless worker
   */
  static async convertToPdf(options: DocumentConvertOptions): Promise<string> {
    const targetFormat = options.targetFormat || "pdf";
    const command = `soffice --headless --convert-to ${targetFormat} "${options.inputPath}" --outdir "${options.outputDirectory}"`;

    try {
      await execAsync(command);
      const baseName = path.basename(options.inputPath, path.extname(options.inputPath));
      return path.join(options.outputDirectory, `${baseName}.${targetFormat}`);
    } catch (err: any) {
      throw new Error(`LibreOffice document conversion failed: ${err?.message}`);
    }
  }
}
