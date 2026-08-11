"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useAutomationStore, AutomationRule } from "../../store/automationStore";

export const AutomationsModal: React.FC = () => {
  const {
    rules,
    logs,
    isAutomationsModalOpen,
    setIsAutomationsModalOpen,
    addRule,
    toggleRule,
    deleteRule,
    triggerWebhookTest,
    clearLogs,
  } = useAutomationStore();

  const [activeTab, setActiveTab] = useState<"rules" | "create" | "logs">("rules");
  const [ruleName, setRuleName] = useState("");
  const [trigger, setTrigger] = useState<AutomationRule["trigger"]>("on_asset_upload");
  const [action, setAction] = useState<AutomationRule["action"]>("send_webhook");
  const [webhookUrl, setWebhookUrl] = useState("");

  if (!isAutomationsModalOpen) return null;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    addRule({
      name: ruleName,
      trigger,
      action,
      webhookUrl: action === "send_webhook" ? webhookUrl : undefined,
      enabled: true,
    });

    setRuleName("");
    setWebhookUrl("");
    setActiveTab("rules");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="w-full max-w-3xl h-[82vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="glass-modal-panel flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <span className="text-sm">⚡</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Centro de Automatizaciones & Webhooks</h3>
                <p className="text-[11px] text-slate-400">Disparadores de Eventos • Conectores IA • Webhooks Salientes</p>
              </div>
            </div>

            <button
              onClick={() => setIsAutomationsModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-xl"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-white/5 mb-4 shrink-0">
            {[
              { id: "rules" as const, label: `Reglas Activas (${rules.length})` },
              { id: "create" as const, label: "+ Crear Regla" },
              { id: "logs" as const, label: `Historial de Ejecución (${logs.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Rules List */}
          {activeTab === "rules" && (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {rules.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No hay reglas de automatización configuradas.</p>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rule.enabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                        <h4 className="font-bold text-white text-xs">{rule.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Disparador: <span className="text-amber-300 font-mono">{rule.trigger}</span> → Acción: <span className="text-cyan-300 font-mono">{rule.action}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerWebhookTest(rule.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-cyan-300 border border-white/5"
                      >
                        Probar Disparo
                      </button>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          rule.enabled ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {rule.enabled ? "Activo" : "Inactivo"}
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Create Rule */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateRule} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1">
                <label className="block text-[11px] uppercase font-semibold text-slate-300">Nombre de la Regla</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="ej: Notificar a Discord al subir video"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-amber-400/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase font-semibold text-slate-300">Evento Disparador</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="on_asset_upload">Al subir nuevo archivo</option>
                    <option value="on_media_job_completed">Al completar compresión de video</option>
                    <option value="on_project_created">Al crear nuevo proyecto</option>
                    <option value="on_security_alert">Al detectar alerta de seguridad</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] uppercase font-semibold text-slate-300">Acción a Ejecutar</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="send_webhook">Enviar Webhook HTTP POST</option>
                    <option value="generate_ai_summary">Generar Resumen con IA</option>
                    <option value="compress_video">Comprimir Video en Segundo Plano</option>
                    <option value="notify_dashboard">Notificación en Dashboard</option>
                  </select>
                </div>
              </div>

              {action === "send_webhook" && (
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase font-semibold text-slate-300">URL del Webhook (Discord / Slack / Endpoint)</label>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-amber-400/50 font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <GlassButton type="button" variant="ghost" size="sm" onClick={() => setActiveTab("rules")}>
                  Cancelar
                </GlassButton>
                <GlassButton type="submit" variant="primary" size="sm">
                  Guardar Regla
                </GlassButton>
              </div>
            </form>
          )}

          {/* Tab 3: Execution Logs */}
          {activeTab === "logs" && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Registros de Eventos Recientes</span>
                <button onClick={clearLogs} className="text-amber-400 hover:text-amber-300">
                  Limpiar Logs
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] pr-1">
                {logs.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No hay registros de eventos aún.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={log.status === "success" ? "text-emerald-400" : "text-amber-400"}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-200">{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
