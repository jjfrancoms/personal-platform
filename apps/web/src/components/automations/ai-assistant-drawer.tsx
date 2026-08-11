"use client";

import React, { useState } from "react";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";
import { useAutomationStore } from "../../store/automationStore";

export const AiAssistantDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen } = useAutomationStore();

  const [prompt, setPrompt] = useState("");
  const [taskType, setTaskType] = useState<"readme" | "tags" | "changelog" | "code">("readme");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isAiDrawerOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedResult("");

    await new Promise((r) => setTimeout(r, 900));

    if (taskType === "readme") {
      setGeneratedResult(`# ${prompt || "Mi Proyecto Modular"}

## 📌 Descripción General
Módulo de software diseñado con arquitectura modular de alto rendimiento, interfaz en Spatial Glassmorphism y almacenamiento dual seguro.

### ✨ Capacidades Principales
- **Interfaz Glassmorphism**: Estética translúcida con aceleración por hardware.
- **Motor de Almacenamiento Dual**: Metadatos en Supabase PostgreSQL + Blobs en Cloudflare R2 sin costo de salida.
- **Microservicio Worker Asíncrono**: Procesamiento FFmpeg en segundo plano para video y audio.

### 🚀 Instalación y Uso
\`\`\`bash
pnpm install
pnpm run dev
\`\`\`
`);
    } else if (taskType === "tags") {
      setGeneratedResult(
        `Etiquetas recomendadas para este proyecto:\n- #FullStack\n- #NextJS16\n- #Glassmorphism\n- #ThreeJS\n- #FFmpeg\n- #Supabase\n- #CloudflareR2\n- #ZeroKnowledge`
      );
    } else if (taskType === "changelog") {
      setGeneratedResult(
        `## 📦 Registro de Cambios (Changelog v1.5.0)\n\n### 🚀 Nuevas Funcionalidades\n- Bóveda de Contraseñas CipherVault con cifrado AES-256-GCM y 2FA/TOTP.\n- Telemetría en tiempo real de Cloudflare R2 y Worker de FFmpeg.\n- Soporte universal para modelos 3D (Three.js), Minecraft (NBT, JAR, bbmodels) y Documentos.`
      );
    } else if (taskType === "code") {
      setGeneratedResult(
        `// Ejemplo de pipeline modular con TypeScript
export async function processPipeline(input: string) {
  const sanitized = input.trim();
  console.log("Procesando pipeline seguro:", sanitized);
  return { status: "success", timestamp: new Date().toISOString() };
}`
      );
    }

    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col shadow-2xl animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-purple-500/25">
            ✨
          </span>
          <div>
            <h3 className="text-base font-bold text-white leading-none">Copiloto IA & Documentación</h3>
            <p className="text-[10px] text-purple-300 mt-0.5">Asistente Inteligente de Código y Proyectos</p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-xl"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Task Type Switcher */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/80 rounded-2xl border border-white/5 mb-4 shrink-0 text-xs font-semibold">
        {[
          { id: "readme" as const, label: "README" },
          { id: "tags" as const, label: "Etiquetas" },
          { id: "changelog" as const, label: "Changelog" },
          { id: "code" as const, label: "Código" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTaskType(t.id)}
            className={`py-1.5 rounded-xl capitalize transition-all text-center text-[11px] ${
              taskType === t.id
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input Prompt */}
      <div className="space-y-2 mb-4 shrink-0">
        <label className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Contexto o Nombre del Proyecto</label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe el nombre del proyecto o describe lo que deseas generar..."
          className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-400/50 resize-none leading-relaxed"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>✨</span>
          <span>{isGenerating ? "Generando con IA..." : "Generar con IA"}</span>
        </button>
      </div>

      {/* Output Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black/40 rounded-2xl border border-white/5 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
          <span>Resultado Generado:</span>
          {generatedResult && (
            <button onClick={handleCopy} className="text-purple-300 hover:text-white font-semibold">
              {copied ? "¡Copiado!" : "Copiar Texto"}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap">
          {generatedResult || (
            <span className="text-slate-500 italic">Haz clic en &quot;Generar con IA&quot; para crear documentación instantánea.</span>
          )}
        </div>
      </div>
    </div>
  );
};
