import { ImageTransformOptions } from "../types";

export class CanvasImageProcessor {
  /**
   * Applies brightness, contrast, saturation, rotation, and resizing using HTML5 Canvas
   */
  static async transform(
    imageSource: HTMLImageElement | string,
    options: ImageTransformOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = typeof imageSource === "string" ? new Image() : imageSource;
      if (typeof imageSource === "string") {
        img.crossOrigin = "anonymous";
        img.src = imageSource;
      }

      const process = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas 2D rendering context"));
          return;
        }

        const rotation = options.rotation || 0;
        const isRotated90or270 = rotation === 90 || rotation === 270;

        let srcWidth = img.naturalWidth || img.width;
        let srcHeight = img.naturalHeight || img.height;

        let targetWidth = options.resizeWidth || (isRotated90or270 ? srcHeight : srcWidth);
        let targetHeight = options.resizeHeight || (isRotated90or270 ? srcWidth : srcHeight);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Apply filters
        const brightness = (options.brightness || 0) + 100;
        const contrast = (options.contrast || 0) + 100;
        const saturation = (options.saturation || 0) + 100;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Rotation
        if (rotation) {
          ctx.rotate((rotation * Math.PI) / 180);
        }

        // Flips
        const scaleX = options.flipHorizontal ? -1 : 1;
        const scaleY = options.flipVertical ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        const drawWidth = isRotated90or270 ? targetHeight : targetWidth;
        const drawHeight = isRotated90or270 ? targetWidth : targetHeight;

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        const format = options.outputFormat || "image/png";
        const quality = options.quality !== undefined ? options.quality : 0.92;
        resolve(canvas.toDataURL(format, quality));
      };

      if (img.complete && img.naturalWidth > 0) {
        process();
      } else {
        img.onload = process;
        img.onerror = (e) => reject(e);
      }
    });
  }

  /**
   * Generates a thumbnail maintaining aspect ratio
   */
  static async generateThumbnail(
    imageSource: HTMLImageElement | string,
    maxDimension = 256
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = typeof imageSource === "string" ? new Image() : imageSource;
      if (typeof imageSource === "string") {
        img.crossOrigin = "anonymous";
        img.src = imageSource;
      }

      const process = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };

      if (img.complete && img.naturalWidth > 0) {
        process();
      } else {
        img.onload = process;
        img.onerror = (e) => reject(e);
      }
    });
  }
}
