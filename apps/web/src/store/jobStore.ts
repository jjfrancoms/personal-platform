import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAssetStore } from "./assetStore";

export interface ProcessingJob {
  id: string;
  projectId: string;
  assetId: string;
  assetName: string;
  type: "video_compress" | "video_to_gif" | "audio_convert" | "extract_thumbnail";
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  progress: number;
  outputName: string;
  outputSizeBytes?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface JobState {
  jobs: ProcessingJob[];
  isDrawerOpen: boolean;

  // Actions
  dispatchJob: (params: {
    projectId: string;
    assetId: string;
    assetName: string;
    type: ProcessingJob["type"];
    outputName: string;
    options?: any;
  }) => Promise<ProcessingJob>;

  cancelJob: (id: string) => void;
  clearCompletedJobs: () => void;
  setIsDrawerOpen: (open: boolean) => void;
}

const DEFAULT_JOBS: ProcessingJob[] = [
  {
    id: "job-1",
    projectId: "proj-4",
    assetId: "asset-rec-1",
    assetName: "gameplay_recording_4k.mp4",
    type: "video_compress",
    status: "completed",
    progress: 100,
    outputName: "gameplay_recording_720p_compressed.mp4",
    outputSizeBytes: 34500000, // 34.5 MB (down from 180MB)
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
];

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: DEFAULT_JOBS,
      isDrawerOpen: false,

      dispatchJob: async ({ projectId, assetId, assetName, type, outputName }) => {
        const jobId = `job-${Math.random().toString(36).substr(2, 9)}`;
        const newJob: ProcessingJob = {
          id: jobId,
          projectId,
          assetId,
          assetName,
          type,
          status: "queued",
          progress: 0,
          outputName,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          jobs: [newJob, ...state.jobs],
          isDrawerOpen: true, // Automatically slide drawer open
        }));

        // Execute async processing simulation with progress increments
        (async () => {
          await new Promise((r) => setTimeout(r, 600));
          set((state) => ({
            jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status: "processing", progress: 20 } : j)),
          }));

          await new Promise((r) => setTimeout(r, 800));
          set((state) => ({
            jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, progress: 55 } : j)),
          }));

          await new Promise((r) => setTimeout(r, 1000));
          set((state) => ({
            jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, progress: 85 } : j)),
          }));

          await new Promise((r) => setTimeout(r, 600));
          const estimatedSize = Math.floor(Math.random() * 8000000) + 1200000;

          set((state) => ({
            jobs: state.jobs.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: "completed",
                    progress: 100,
                    outputSizeBytes: estimatedSize,
                    completedAt: new Date().toISOString(),
                  }
                : j
            ),
          }));

          // Add output file as a new asset in the project
          useAssetStore.getState().uploadAsset({
            projectId,
            file: {
              name: outputName,
              size: estimatedSize,
              type: outputName.endsWith(".gif") ? "image/gif" : outputName.endsWith(".mp3") ? "audio/mpeg" : "video/mp4",
            },
          });
        })();

        return newJob;
      },

      cancelJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: "failed", errorMessage: "Cancelled by user" } : j)),
        }));
      },

      clearCompletedJobs: () => {
        set((state) => ({
          jobs: state.jobs.filter((j) => j.status === "processing" || j.status === "queued"),
        }));
      },

      setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
    }),
    {
      name: "personal-platform-jobs",
    }
  )
);
