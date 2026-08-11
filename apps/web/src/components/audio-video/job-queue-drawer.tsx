"use client";

import React from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useJobStore } from "../../store/jobStore";

export const JobQueueDrawer: React.FC = () => {
  const { jobs, isDrawerOpen, setIsDrawerOpen, cancelJob, clearCompletedJobs } = useJobStore();

  const activeJobs = jobs.filter((j) => j.status === "processing" || j.status === "queued");

  const formatBytes = (bytes?: number): string => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full glass-pill border border-white/15 bg-slate-950/80 shadow-2xl hover:border-purple-500/50 hover:shadow-purple-500/20 transition-all duration-200 group text-xs text-white"
        >
          <div className="relative">
            <Icon name="settings" size={14} className={activeJobs.length > 0 ? "animate-spin text-purple-400" : "text-slate-400"} />
            {activeJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            )}
          </div>
          <span className="font-semibold">
            {activeJobs.length > 0 ? `${activeJobs.length} Tareas en Proceso` : "Cola de Tareas FFmpeg"}
          </span>
        </button>
      </div>

      {/* Slide-out Panel */}
      {isDrawerOpen && (
        <div className="fixed bottom-16 right-5 z-50 w-full max-w-sm animate-fade-in">
          <div className="glass-modal-panel p-4 border-white/10 shadow-2xl relative flex flex-col max-h-[460px] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Tareas Asíncronas ({jobs.length})
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearCompletedJobs}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/5"
                >
                  Limpiar Finalizadas
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {jobs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 italic">No hay tareas multimedia en cola.</p>
              ) : (
                jobs.map((job) => {
                  const isFinished = job.status === "completed";
                  const isFailed = job.status === "failed";
                  const isRunning = job.status === "processing" || job.status === "queued";

                  return (
                    <div
                      key={job.id}
                      className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white truncate max-w-[200px]">{job.outputName}</p>
                          <p className="text-[10px] text-slate-400">Origen: {job.assetName}</p>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isFinished
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isFailed
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse"
                          }`}
                        >
                          {job.status === "completed" ? "Completado" : job.status === "processing" ? "Procesando" : job.status === "failed" ? "Error" : "En Cola"}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {isRunning && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Processing FFmpeg pipeline...</span>
                            <span className="text-pink-400 font-bold">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Result metrics */}
                      {isFinished && job.outputSizeBytes && (
                        <p className="text-[10px] text-emerald-400">
                          ✓ Completado ({formatBytes(job.outputSizeBytes)})
                        </p>
                      )}

                      {/* Actions */}
                      {isRunning && (
                        <button
                          onClick={() => cancelJob(job.id)}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Cancelar tarea
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
