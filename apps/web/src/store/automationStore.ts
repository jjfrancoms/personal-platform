import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: "on_asset_upload" | "on_job_completed" | "on_project_create";
  action: "send_webhook" | "ai_summarize" | "auto_tag";
  webhookUrl?: string;
  enabled: boolean;
}

export interface WebhookLog {
  id: string;
  ruleName: string;
  event: string;
  status: "success" | "failed";
  statusCode: number;
  payload: Record<string, any>;
  timestamp: string;
}

interface AutomationState {
  rules: AutomationRule[];
  logs: WebhookLog[];
  isAutomationsModalOpen: boolean;
  isAiDrawerOpen: boolean;

  // Actions
  addRule: (rule: Omit<AutomationRule, "id">) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  triggerWebhookTest: (ruleName: string, url: string) => Promise<boolean>;
  clearLogs: () => void;
  setIsAutomationsModalOpen: (open: boolean) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Discord Asset Upload Alert",
    trigger: "on_asset_upload",
    action: "send_webhook",
    webhookUrl: "https://discord.com/api/webhooks/128391/personal-platform-notify",
    enabled: true,
  },
  {
    id: "rule-2",
    name: "AI Automatic Project Categorization",
    trigger: "on_project_create",
    action: "auto_tag",
    enabled: true,
  },
  {
    id: "rule-3",
    name: "Worker Job Completion Dispatcher",
    trigger: "on_job_completed",
    action: "send_webhook",
    webhookUrl: "https://api.mycustomserver.dev/webhooks/processing-done",
    enabled: false,
  },
];

const DEFAULT_LOGS: WebhookLog[] = [
  {
    id: "log-1",
    ruleName: "Discord Asset Upload Alert",
    event: "asset.created",
    status: "success",
    statusCode: 200,
    payload: { asset: "gameplay_recording_4k.mp4", size: 188743680, provider: "cloudflare_r2" },
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export const useAutomationStore = create<AutomationState>()(
  persist(
    (set, get) => ({
      rules: DEFAULT_RULES,
      logs: DEFAULT_LOGS,
      isAutomationsModalOpen: false,
      isAiDrawerOpen: false,

      addRule: (rule) => {
        const newRule: AutomationRule = {
          ...rule,
          id: `rule-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({ rules: [...state.rules, newRule] }));
      },

      toggleRule: (id) => {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
        }));
      },

      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        }));
      },

      triggerWebhookTest: async (ruleName, url) => {
        const testPayload = {
          event: "test.ping",
          platform: "Personal Platform Core",
          timestamp: new Date().toISOString(),
        };

        const newLog: WebhookLog = {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          ruleName,
          event: "test.ping",
          status: "success",
          statusCode: 200,
          payload: testPayload,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({ logs: [newLog, ...state.logs] }));
        return true;
      },

      clearLogs: () => set({ logs: [] }),

      setIsAutomationsModalOpen: (isAutomationsModalOpen) => set({ isAutomationsModalOpen }),
      setIsAiDrawerOpen: (isAiDrawerOpen) => set({ isAiDrawerOpen }),
    }),
    {
      name: "personal-platform-automations",
    }
  )
);
