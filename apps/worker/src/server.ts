import express from "express";
import { VideoProcessor } from "./ffmpeg/video-processor";
import { AudioProcessor } from "./ffmpeg/audio-processor";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Health status check
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "personal-platform-worker",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    ffmpeg: "ready",
  });
});

// Compress video job
app.post("/jobs/video/compress", async (req, res) => {
  try {
    const { inputPath, outputPath, crf, resolution, format } = req.body;
    if (!inputPath || !outputPath) {
      return res.status(400).json({ error: "inputPath and outputPath required" });
    }

    await VideoProcessor.compressVideo({
      inputPath,
      outputPath,
      crf,
      resolution,
      format,
    });

    res.json({ success: true, outputPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Convert video to GIF
app.post("/jobs/video/gif", async (req, res) => {
  try {
    const { inputPath, outputPath, fps, width, startTimeSeconds, durationSeconds } = req.body;
    if (!inputPath || !outputPath) {
      return res.status(400).json({ error: "inputPath and outputPath required" });
    }

    await VideoProcessor.convertToGif({
      inputPath,
      outputPath,
      fps,
      width,
      startTimeSeconds,
      durationSeconds,
    });

    res.json({ success: true, outputPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Audio convert job
app.post("/jobs/audio/convert", async (req, res) => {
  try {
    const { inputPath, outputPath, targetFormat, bitrateKbps } = req.body;
    if (!inputPath || !outputPath || !targetFormat) {
      return res.status(400).json({ error: "inputPath, outputPath and targetFormat required" });
    }

    await AudioProcessor.convertAudio({
      inputPath,
      outputPath,
      targetFormat,
      bitrateKbps,
    });

    res.json({ success: true, outputPath });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Probe metadata
app.post("/jobs/probe", async (req, res) => {
  try {
    const { inputPath } = req.body;
    if (!inputPath) {
      return res.status(400).json({ error: "inputPath required" });
    }

    const metadata = await VideoProcessor.probeMetadata(inputPath);
    res.json({ success: true, metadata });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Worker] Personal Platform Heavy Worker listening on port ${PORT}`);
});
