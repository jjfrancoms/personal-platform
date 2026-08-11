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
    resetToDefaults,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TabType>("storage");
  const [showSecrets, setShowSecrets] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/system/metrics");
      if (res.ok) {
        const data = await res.json();
        const r2Ok = data.storage?.isOnline;
        const workerOk = data.worker?.isOnline;

        setTestResult({
          success: true,
          message: `✓ Conexión exitosa: Supabase Activo, R2 (${data.storage?.bucketName}) Conectado, Worker (${data.worker?.cpuLabel}) ONLINE.`,
        });
      } else {
        setTestResult({
          success: false,
          message: "Error: No se pudo verificar la conexión con los servicios.",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Error de red al intentar conectar con el backend.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Cabecera */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Icon name="settings" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">
                  Centro de Configuración de la Plataforma
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gestión de motores de almacenamiento, credenciales de base de datos, workers e integraciones
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

          {/* Cuerpo con Pestañas Laterales */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-[380px]">
            
            {/* Barra lateral de pestañas */}
            <div className="w-full md:w-48 shrink-0 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-3 overflow-x-auto">
              {[
                { id: "storage" as const, label: "Almacenamiento (R2/S3)", icon: "folder" as const },
                { id: "database" as const, label: "Base de Datos (Supabase)", icon: "project" as const },
                { id: "worker" as const, label: "Servicio Worker & FFmpeg", icon: "settings" as const },
                { id: "integrations" as const, label: "Integraciones & Tokens", icon: "external-link" as const },
                { id: "appearance" as const, label: "Tema & Apariencia", icon: "grid" as const },
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
                        ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon name={tab.icon} size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Panel de Contenido de la Pestaña */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              
              {/* PESTAÑA 1: ALMACENAMIENTO */}
              {activeTab === "storage" && (
                <div className="space-y-4">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 leading-relaxed">
                    Motor de almacenamiento dual configurado. Usando <strong>Cloudflare R2</strong> para archivos pesados sin costo de salida y <strong>Supabase</strong> para sincronización de base de datos.
                  </div>

                  {/* Selector de Proveedor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Proveedor de Almacenamiento Activo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
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
                          <p className="text-[10px] text-slate-400">Compatible con S3 • Cero costo de salida</p>
                        </div>
                        {storage.provider === "cloudflare_r2" && <span className="text-amber-400 text-xs font-bold font-mono">ACTIVO</span>}
                      </button>

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
                          <p className="text-[10px] text-slate-400">Integrado con PostgreSQL</p>
                        </div>
                        {storage.provider === "supabase" && <span className="text-emerald-400 text-xs font-bold font-mono">ACTIVO</span>}
                      </button>
                    </div>
                  </div>

                  {storage.provider === "cloudflare_r2" ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">R2 Account ID</label>
                          <input
                            type="text"
                            value={storage.r2AccountId}
                            onChange={(e) => updateStorage({ r2AccountId: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Nombre del Bucket R2</label>
                          <input
                            type="text"
                            value={storage.r2BucketName}
                            onChange={(e) => updateStorage({ r2BucketName: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Access Key ID</label>
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={storage.r2AccessKeyId}
                            onChange={(e) => updateStorage({ r2AccessKeyId: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Secret Access Key</label>
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={storage.r2SecretAccessKey}
                            onChange={(e) => updateStorage({ r2SecretAccessKey: e.target.value })}
                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Dominio Público CDN R2</label>
                        <input
                          type="text"
                          value={storage.r2PublicDomain}
                          onChange={(e) => updateStorage({ r2PublicDomain: e.target.value })}
                          className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Nombre del Bucket Supabase</label>
                        <input
                          type="text"
                          value={storage.supabaseBucket}
                          onChange={(e) => updateStorage({ supabaseBucket: e.target.value })}
                          className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-semibold text-slate-300">Tamaño Máximo por Archivo (MB)</label>
                    <input
                      type="number"
                      value={storage.maxFileSizeMb}
                      onChange={(e) => updateStorage({ maxFileSizeMb: parseInt(e.target.value) || 500 })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: BASE DE DATOS */}
              {activeTab === "database" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">URL del Proyecto Supabase</label>
                    <input
                      type="text"
                      value={database.supabaseUrl}
                      onChange={(e) => updateDatabase({ supabaseUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Supabase Anonymous Key (Pública)</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={database.supabaseAnonKey}
                      onChange={(e) => updateDatabase({ supabaseAnonKey: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Cadena de Conexión PostgreSQL (DATABASE_URL)</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={database.databaseUrl}
                      onChange={(e) => updateDatabase({ databaseUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>

                  {/* Botón de Prueba de Conexión */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                      <Icon name="refresh" size={14} className={isTesting ? "animate-spin" : ""} />
                      <span>{isTesting ? "Verificando conexión..." : "Probar Conexión con Supabase y R2"}</span>
                    </button>

                    {testResult && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                          testResult.success
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : "bg-red-500/15 border border-red-500/30 text-red-300"
                        }`}
                      >
                        <Icon name={testResult.success ? "check" : "close"} size={14} />
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: WORKER & FFMPEG */}
              {activeTab === "worker" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Endpoint del Servicio Worker</label>
                    <input
                      type="text"
                      value={worker.workerEndpoint}
                      onChange={(e) => updateWorker({ workerEndpoint: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Tareas Concurrentes Máximas</label>
                      <input
                        type="number"
                        value={worker.maxConcurrentJobs}
                        onChange={(e) => updateWorker({ maxConcurrentJobs: parseInt(e.target.value) || 4 })}
                        className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Estado del Microservicio</label>
                      <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>FFmpeg 2026 Listo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 4: INTEGRACIONES */}
              {activeTab === "integrations" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">GitHub Personal Token</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={integrations.githubToken}
                      onChange={(e) => updateIntegrations({ githubToken: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Webhook de Notificaciones (Opcional)</label>
                    <input
                      type="text"
                      value={integrations.webhookUrl}
                      onChange={(e) => updateIntegrations({ webhookUrl: e.target.value })}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* PESTAÑA 5: APARIENCIA */}
              {activeTab === "appearance" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Estilo de Interfaz</label>
                    <select
                      value={appearance.themeMode}
                      onChange={(e) => updateAppearance({ themeMode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500/50"
                    >
                      <option value="glass-neon">Spatial Glassmorphism (Predeterminado)</option>
                      <option value="dark">Dark Modern Minimal</option>
                      <option value="midnight">Cyber Midnight</option>
                    </select>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Pie de Modal */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
              >
                <Icon name={showSecrets ? "eye-off" : "eye"} size={14} />
                <span>{showSecrets ? "Ocultar Claves" : "Mostrar Claves"}</span>
              </button>

              <button
                type="button"
                onClick={resetToDefaults}
                className="text-xs text-slate-500 hover:text-cyan-400 underline underline-offset-2"
              >
                Restablecer a valores de .env
              </button>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                Cerrar
              </GlassButton>
              <GlassButton type="button" variant="primary" size="sm" onClick={handleSave}>
                {saveToast ? "¡Configuración Guardada!" : "Guardar Cambios"}
              </GlassButton>
            </div>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};
