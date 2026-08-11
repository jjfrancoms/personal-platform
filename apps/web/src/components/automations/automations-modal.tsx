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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="flex-1 flex flex-col p-6 border-white/10 shadow-2xl relative overflow-hidden" glow>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300">
                <Icon name="settings" size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Automations & Webhooks Hub</h3>
                <p className="text-[10px] text-slate-400">Event Triggers • AI Connectors • Outbound Webhooks</p>
              </div>
            </div>

            <button
              onClick={() => setIsAutomationsModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 mb-4 shrink-0">
            {[
              { id: "rules" as const, label: `Workflow Rules (${rules.length})` },
              { id: "create" as const, label: "+ Create Rule" },
              { id: "logs" as const, label: `Execution Logs (${logs.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
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
                <p className="text-xs text-slate-500 text-center py-8">No automation rules configured.</p>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{rule.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            rule.enabled
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-700/40 text-slate-400"
                          }`}
                        >
                          {rule.enabled ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        When <span className="text-violet-300 font-mono">{rule.trigger}</span> → Action:{" "}
                        <span className="text-cyan-300 font-mono">{rule.action}</span>
                      </p>
                      {rule.webhookUrl && (
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-md">
                          Endpoint: {rule.webhookUrl}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rule.webhookUrl && (
                        <GlassButton
                          onClick={() => triggerWebhookTest(rule.name, rule.webhookUrl!)}
                          variant="secondary"
                          size="sm"
                          className="text-[11px] py-1"
                        >
                          Test Ping
                        </GlassButton>
                      )}

                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                          rule.enabled
                            ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
                            : "bg-white/5 text-slate-400 border-white/10"
                        }`}
                      >
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </button>

                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Create Rule Form */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateRule} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Discord Notification on New Video Upload"
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Trigger Event</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  >
                    <option value="on_asset_upload">On Asset Uploaded</option>
                    <option value="on_job_completed">On Worker Job Completed</option>
                    <option value="on_project_create">On Project Created</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  >
                    <option value="send_webhook">Dispatch HTTP Webhook</option>
                    <option value="ai_summarize">AI Auto-Summarize</option>
                    <option value="auto_tag">AI Auto-Tag Category</option>
                  </select>
                </div>
              </div>

              {action === "send_webhook" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase">Target Webhook URL</label>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/... or https://myapi.com/hook"
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none font-mono focus:border-violet-500/50"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <GlassButton type="submit" variant="primary" size="sm">
                  Save Automation Rule
                </GlassButton>
              </div>
            </form>
          )}

          {/* Tab 3: Execution Logs */}
          {activeTab === "logs" && (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              <div className="flex justify-end pb-1">
                <button onClick={clearLogs} className="text-[11px] text-slate-400 hover:text-white underline">
                  Clear Log History
                </button>
              </div>
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No webhook event logs recorded.</p>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{l.ruleName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {l.statusCode} OK
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="p-2 rounded bg-slate-950/80 border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(l.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}

        </GlassCard>
      </div>
    </div>
  );
};
