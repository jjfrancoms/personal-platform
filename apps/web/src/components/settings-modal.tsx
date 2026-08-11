"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useSettingsStore } from "../store/settingsStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "storage" | "database" | "worker" | "integrations" | "appearance";

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    storage,
    database,
    worker,
    integrations,
    appearance,
    updateStorage,
    updateDatabase,
    updateWorker,
    updateIntegrations,
    updateAppearance,
    testConnection,
    resetToDefaults,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TabType>("storage");
  const [showSecrets, setShowSecrets] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await testConnection();
      setTestResult("Success: Connected to Database & Auth services!");
    } catch {
      setTestResult("Error: Could not verify connection.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-300">
                <Icon name="settings" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">
                  Platform Configuration Center
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unified controls for storage engines, database credentials, workers, and UI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Body with Sidebar Tabs */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-[380px]">
            
            {/* Tabs sidebar */}
            <div className="w-full md:w-48 shrink-0 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-3 overflow-x-auto">
              {[
                { id: "storage" as const, label: "Storage Engine", icon: "folder" as const },
                { id: "database" as const, label: "Database & Auth", icon: "project" as const },
                { id: "worker" as const, label: "Worker & Docker", icon: "settings" as const },
                { id: "integrations" as const, label: "Integrations & APIs", icon: "external-link" as const },
                { id: "appearance" as const, label: "System & Theme", icon: "grid" as const },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setTestResult(null);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-glow-primary"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon name={tab.icon} size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content panel */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              
              {/* TAB: Storage */}
              {activeTab === "storage" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 leading-relaxed">
                    Configure your dual-engine file storage. Use <strong>Supabase Storage</strong> for immediate media assets or <strong>Cloudflare R2</strong> for heavy binary blobs with zero egress fees.
                  </div>

                  {/* Provider toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Active Storage Provider
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateStorage({ provider: "supabase" })}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          storage.provider === "supabase"
                            ? "bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">Supabase Storage</p>
                          <p className="text-[10px] text-slate-400">PostgreSQL integrated storage</p>
                        </div>
                        {storage.provider === "supabase" && <span className="text-emerald-400 text-xs font-bold">ACTIVE</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStorage({ provider: "cloudflare_r2" })}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          storage.provider === "cloudflare_r2"
                            ? "bg-amber-500/15 border-amber-500/40 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">Cloudflare R2</p>
                          <p className="text-[10px] text-slate-400">S3-compatible, zero-egress</p>
                        </div>
                        {storage.provider === "cloudflare_r2" && <span className="text-amber-400 text-xs font-bold">ACTIVE</span>}
                      </button>
                    </div>
                  </div>

                  {storage.provider === "supabase" ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Supabase Bucket Name</label>
                        <input
                          type="text"
                          value={storage.supabaseBucket}
                          onChange={(e) => updateStorage({ supabaseBucket: e.target.value })}
                          className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">R2 Account ID</label>
                          <input
                            type="text"
                            value={storage.r2AccountId}
                            onChange={(e) => updateStorage({ r2AccountId: e.target.value })}
                            placeholder="e.g. 7f8a9b..."
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">R2 Bucket Name</label>
                          <input
                            type="text"
                            value={storage.r2BucketName}
                            onChange={(e) => updateStorage({ r2BucketName: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Access Key ID</label>
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={storage.r2AccessKeyId}
                            onChange={(e) => updateStorage({ r2AccessKeyId: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Secret Access Key</label>
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={storage.r2SecretAccessKey}
                            onChange={(e) => updateStorage({ r2SecretAccessKey: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Public CDN Custom Domain</label>
                        <input
                          type="text"
                          value={storage.r2PublicDomain}
                          onChange={(e) => updateStorage({ r2PublicDomain: e.target.value })}
                          className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-semibold text-slate-300">Max Upload File Size (MB)</label>
                    <input
                      type="number"
                      value={storage.maxFileSizeMb}
                      onChange={(e) => updateStorage({ maxFileSizeMb: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              )}

              {/* TAB: Database & Auth */}
              {activeTab === "database" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Supabase Project URL</label>
                    <input
                      type="text"
                      value={database.supabaseUrl}
                      onChange={(e) => updateDatabase({ supabaseUrl: e.target.value })}
                      placeholder="https://xxx.supabase.co"
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Supabase Anonymous Key (Client-side)</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={database.supabaseAnonKey}
                      onChange={(e) => updateDatabase({ supabaseAnonKey: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50 font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">PostgreSQL Connection String (Drizzle ORM)</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={database.databaseUrl}
                      onChange={(e) => updateDatabase({ databaseUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50 font-mono text-[11px]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <GlassButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                    >
                      {isTesting ? "Pinging..." : "Test Connection"}
                    </GlassButton>

                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSecrets}
                        onChange={(e) => setShowSecrets(e.target.checked)}
                        className="rounded bg-white/5 border-white/10"
                      />
                      Reveal Keys
                    </label>
                  </div>

                  {testResult && (
                    <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      {testResult}
                    </p>
                  )}
                </div>
              )}

              {/* TAB: Worker & Docker */}
              {activeTab === "worker" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Docker Worker Microservice Endpoint</label>
                    <input
                      type="text"
                      value={worker.workerEndpoint}
                      onChange={(e) => updateWorker({ workerEndpoint: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Max Concurrent Pipeline Jobs</label>
                    <input
                      type="number"
                      value={worker.maxConcurrentJobs}
                      onChange={(e) => updateWorker({ maxConcurrentJobs: parseInt(e.target.value) || 2 })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={worker.enableFfmpegHardwareAccel}
                        onChange={(e) => updateWorker({ enableFfmpegHardwareAccel: e.target.checked })}
                        className="w-4 h-4 accent-blue-500 rounded"
                      />
                      Enable FFmpeg Hardware Acceleration (GPU encoding)
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={worker.autoGenerateThumbnails}
                        onChange={(e) => updateWorker({ autoGenerateThumbnails: e.target.checked })}
                        className="w-4 h-4 accent-blue-500 rounded"
                      />
                      Automatically generate video/3D thumbnails on upload
                    </label>
                  </div>
                </div>
              )}

              {/* TAB: Integrations */}
              {activeTab === "integrations" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Webhook Dispatch URL</label>
                    <input
                      type="text"
                      value={integrations.webhookUrl}
                      onChange={(e) => updateIntegrations({ webhookUrl: e.target.value })}
                      placeholder="https://hooks.slack.com/... or Discord webhook"
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">OpenAI API Key (Data processing & tagging)</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={integrations.openAiApiKey}
                      onChange={(e) => updateIntegrations({ openAiApiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50 font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">GitHub Personal Access Token</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={integrations.githubToken}
                      onChange={(e) => updateIntegrations({ githubToken: e.target.value })}
                      placeholder="ghp_..."
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB: Appearance */}
              {activeTab === "appearance" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Theme Visual Preset</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "glass-neon" as const, label: "Glass Neon (Default)" },
                        { id: "dark" as const, label: "Pure Dark" },
                        { id: "midnight" as const, label: "Deep Midnight" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateAppearance({ themeMode: t.id })}
                          className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            appearance.themeMode === t.id
                              ? "bg-blue-600/30 border-blue-500/50 text-white"
                              : "bg-white/[0.02] border-white/10 text-slate-400"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-semibold text-slate-300">Soft-Delete File Retention (Days)</label>
                    <input
                      type="number"
                      value={appearance.autoSoftDeleteRetentionDays}
                      onChange={(e) => updateAppearance({ autoSoftDeleteRetentionDays: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 shrink-0">
            <button
              onClick={resetToDefaults}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Reset to Defaults
            </button>
            <GlassButton onClick={onClose} variant="primary" size="sm">
              Save & Apply Settings
            </GlassButton>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};
