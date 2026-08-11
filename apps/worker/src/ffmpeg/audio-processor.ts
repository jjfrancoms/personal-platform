import ffmpeg from "./setup";

export interface AudioConvertOptions {
  inputPath: string;
  outputPath: string;
  targetFormat: "mp3" | "wav" | "aac" | "ogg" | "flac";
  bitrateKbps?: 320 | 192 | 128 | 96;
  onProgress?: (progressPercent: number) => void;
}

export class AudioProcessor {
  /**
   * Converts audio format and applies target bitrate
   */
  static convertAudio(options: AudioConvertOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(options.inputPath);

      if (options.targetFormat === "mp3") {
        command = command.audioCodec("libmp3lame");
      } else if (options.targetFormat === "aac") {
        command = command.audioCodec("aac");
      } else if (options.targetFormat === "ogg") {
        command = command.audioCodec("libvorbis");
      } else if (options.targetFormat === "flac") {
        command = command.audioCodec("flac");
      }

      if (options.bitrateKbps && options.targetFormat !== "wav" && options.targetFormat !== "flac") {
        command = command.audioBitrate(options.bitrateKbps);
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
   * Extracts clean audio stream from a video container
   */
  static extractAudioFromVideo(
    videoInputPath: string,
    audioOutputPath: string,
    format: "mp3" | "aac" = "mp3"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoInputPath)
        .noVideo()
        .audioCodec(format === "mp3" ? "libmp3lame" : "aac")
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(audioOutputPath);
    });
  }
}
