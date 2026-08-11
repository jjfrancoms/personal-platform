import ffmpeg from "./setup";

export interface VideoCompressOptions {
  inputPath: string;
  outputPath: string;
  crf?: number; // 18 (highest quality) to 28 (high compression)
  resolution?: "1080p" | "720p" | "480p" | "original";
  format?: "mp4" | "webm";
  onProgress?: (progressPercent: number) => void;
}

export interface VideoToGifOptions {
  inputPath: string;
  outputPath: string;
  fps?: number; // default 15
  width?: number; // default 480
  startTimeSeconds?: number;
  durationSeconds?: number;
}

export class VideoProcessor {
  /**
   * Compresses video using H.264/WebM with target CRF and resolution downscaling
   */
  static compressVideo(options: VideoCompressOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath);

      if (options.format === "webm") {
        command = command.videoCodec("libvpx-vp9").audioCodec("libopus");
      } else {
        command = command.videoCodec("libx264").audioCodec("aac");
      }

      // Quality (CRF)
      const crfValue = options.crf || 23;
      command = command.outputOptions([`-crf ${crfValue}`, "-preset fast"]);

      // Resolution downscaling
      if (options.resolution === "1080p") {
        command = command.size("1920x1080");
      } else if (options.resolution === "720p") {
        command = command.size("1280x720");
      } else if (options.resolution === "480p") {
        command = command.size("854x480");
      }

      command
        .on("progress", (progress) => {
          if (options.onProgress && progress.percent) {
            options.onProgress(Math.min(100, Math.round(progress.percent)));
          }
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(options.outputPath);
    });
  }

  /**
   * Converts a segment of video into an optimized animated GIF
   */
  static convertToGif(options: VideoToGifOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath);

      if (options.startTimeSeconds) {
        command = command.setStartTime(options.startTimeSeconds);
      }
      if (options.durationSeconds) {
        command = command.setDuration(options.durationSeconds);
      }

      const fps = options.fps || 15;
      const width = options.width || 480;

      command
        .complexFilter([`fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`])
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(options.outputPath);
    });
  }

  /**
   * Extracts a video frame thumbnail at a given timestamp
   */
  static extractThumbnail(
    inputPath: string,
    outputPath: string,
    timestamp = "00:00:01"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: outputPath,
          size: "640x360",
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });
  }

  /**
   * Extracts metadata via FFprobe
   */
  static probeMetadata(inputPath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}
