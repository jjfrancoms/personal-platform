"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@personal-platform/ui";
import { useProjectStore, Project } from "../store/projectStore";
import { useAssetStore } from "../store/assetStore";
import { useAutomationStore } from "../store/automationStore";
import { ProjectModal } from "../components/project-modal";
import { FolderModal } from "../components/folder-modal";
import { TagModal } from "../components/tag-modal";
import { SettingsModal } from "../components/settings-modal";
import { FileViewerModal } from "../components/file-manager/file-viewer-modal";
import { JobQueueDrawer } from "../components/audio-video/job-queue-drawer";
import { AutomationsModal } from "../components/automations/automations-modal";
import { AiAssistantDrawer } from "../components/automations/ai-assistant-drawer";
import { VaultModal } from "../components/vault/vault-modal";

export default function DashboardPage() {
  const {
    projects,
    tags,
    folders,
    searchQuery,
    selectedTagId,
    selectedFolderId,
    sortBy,
    sortOrder,
    filterTab,
    layoutView,
    setSearchQuery,
    setSelectedTagId,
    setSelectedFolderId,
    setSortBy,
    toggleSortOrder,
    setFilterTab,
    setLayoutView,
    deleteProject,
    toggleFavorite,
    duplicateProject,
  } = useProjectStore();

  const { assets } = useAssetStore();
  const { setIsAutomationsModalOpen, setIsAiDrawerOpen } = useAutomationStore();

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [fileViewerProjectId, setFileViewerProjectId] = useState<string | null>(null);

  // Métricas del Sistema en Tiempo Real (Cloudflare R2, Worker, Supabase)
  const [systemMetrics, setSystemMetrics] = useState<{
    storage: {
      usedBytes: number;
      usedFormatted: string;
      quotaBytes: number;
      quotaFormatted: string;
      percentage: number;
      fileCount: number;
      provider: string;
      bucketName: string;
      isOnline: boolean;
      statusText: string;
    };
    worker: {
      isOnline: boolean;
      service: string;
      statusLabel: string;
      cpuCores: number;
      cpuLabel: string;
      activeJobs: number;
      uptimeFormatted: string;
      gaugePercentage: number;
    };
  }>({
    storage: {
      usedBytes: 0,
      usedFormatted: "0 B",
      quotaBytes: 10 * 1024 * 1024 * 1024,
      quotaFormatted: "10 GB",
      percentage: 0,
      fileCount: 0,
      provider: "Cloudflare R2 + Supabase",
      bucketName: "personal-platform-assets",
      isOnline: true,
      statusText: "Cloudflare R2 Conectado",
    },
    worker: {
      isOnline: true,
      service: "FFmpeg 2026",
      statusLabel: "FFmpeg Listo",
      cpuCores: 4,
      cpuLabel: "4 Nodos CPU • Listo",
      activeJobs: 0,
      uptimeFormatted: "0m",
      gaugePercentage: 100,
    },
  });

  // Consulta en vivo al backend de métricas cada 10 segundos
  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/system/metrics");
        if (res.ok && isMounted) {
          const data = await res.json();
          setSystemMetrics(data);
        }
      } catch {
        // En caso de desconexión momentánea
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const active = projects.filter((p) => !p.archived);
    return {
      total: active.length,
      favorites: active.filter((p) => p.isFavorite).length,
      archived: projects.filter((p) => p.archived).length,
      totalAssets: assets.length,
    };
  }, [projects, assets]);

  // Project filtering and sorting logic
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (filterTab === "all" && p.archived) return false;
        if (filterTab === "favorites" && (p.archived || !p.isFavorite)) return false;
        if (filterTab === "archived" && !p.archived) return false;

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchDesc = p.description?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }

        if (selectedFolderId && p.folderId !== selectedFolderId) return false;
        if (selectedTagId && !p.tags.includes(selectedTagId)) return false;

        return true;
      })
      .sort((a, b) => {
        let fieldA: string | number = "";
        let fieldB: string | number = "";

        if (sortBy === "name") {
          fieldA = a.name.toLowerCase();
          fieldB = b.name.toLowerCase();
        } else if (sortBy === "createdAt") {
          fieldA = new Date(a.createdAt).getTime();
          fieldB = new Date(b.createdAt).getTime();
        } else if (sortBy === "updatedAt") {
          fieldA = new Date(a.updatedAt).getTime();
          fieldB = new Date(b.updatedAt).getTime();
        }

        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [projects, filterTab, searchQuery, selectedFolderId, selectedTagId, sortBy, sortOrder]);

  const openCreateModal = () => {
    setSelectedProjectId(null);
    setIsProjectModalOpen(true);
  };

  const openEditModal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectId(id);
    setIsProjectModalOpen(true);
  };

  const openFileViewer = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (id === "proj-vault") {
      setIsVaultModalOpen(true);
      return;
    }
    setFileViewerProjectId(id);
  };

  return (
    <div className="min-h-screen w-full p-3 sm:p-5 lg:p-6 flex flex-col items-stretch justify-start relative">
      
      {/* 1. TOP FLOATING BROWSER / SEARCH & PROFILE CAPSULE (Full-Width Responsive Bar) */}
      <header className="w-full mb-4 sm:mb-6 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Contenedor de Marca y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Cápsula de Marca */}
          <div className="glass-pill px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <span className="text-xs font-black text-white">P</span>
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-white leading-none">Plataforma Personal</h1>
                <p className="text-[9px] text-amber-300/80 font-medium tracking-wider uppercase">Espacio de Trabajo Digital</p>
              </div>
            </div>
            <span className="sm:hidden px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {stats.total} Proyectos
            </span>
          </div>

          {/* Buscador Global */}
          <div className="relative w-full sm:w-80 md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyectos, cuentas, archivos..."
              className="w-full pl-9 pr-4 py-2 glass-pill text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400/50 transition-all"
            />
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Icon name="search" size={13} />
            </span>
          </div>
        </div>

        {/* Acciones Superiores */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full lg:w-auto">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-violet-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <span>✨</span>
            <span className="hidden xs:inline">Copiloto IA</span>
          </button>

          <button
            onClick={() => setIsAutomationsModalOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-amber-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <span>⚡</span>
            <span className="hidden xs:inline">Automatizaciones</span>
          </button>

          <button
            onClick={() => setIsVaultModalOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/20"
          >
            <Icon name="shield" size={13} />
            <span className="hidden xs:inline">Contraseñas</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-cyan-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Icon name="settings" size={13} />
            <span className="hidden xs:inline">Configuración</span>
          </button>

          {/* Perfil */}
          <div className="glass-pill pl-1.5 pr-3.5 py-1 sm:py-1.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow shrink-0">
              JF
            </div>
            <span className="text-xs font-semibold text-white hidden sm:inline">Juan Franco</span>
          </div>
        </div>
      </header>

      {/* 2. CONTENEDOR PRINCIPAL CON DOCK FLOTANTE */}
      <div className="w-full flex-1 flex flex-col md:flex-row items-start gap-4 lg:gap-6 relative">
        
        {/* DOCK FLOTANTE DE ACCESOS RÁPIDOS CON EFECTO GLASS */}
        <aside className="glass-dock-pill py-3 px-4 md:py-6 md:px-3.5 flex flex-row md:flex-col items-center justify-around md:justify-start gap-3 md:gap-5 w-full md:w-auto shrink-0 sticky top-3 md:top-20 z-30 shadow-2xl">
          <button
            onClick={() => { setSelectedFolderId(null); setSelectedTagId(null); }}
            className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/25 hover:scale-110 active:scale-95 transition-all shrink-0 group relative"
            title="Panel Principal"
          >
            <Icon name="dashboard" size={18} />
          </button>

          <button
            onClick={() => setIsVaultModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shrink-0 shadow-lg shadow-emerald-500/25 group relative"
            title="Bóveda de Contraseñas & Cuentas (CipherVault)"
          >
            <Icon name="shield" size={18} />
          </button>

          <button
            onClick={openCreateModal}
            className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0 shadow-lg shadow-orange-500/20"
            title="Crear Nuevo Proyecto"
          >
            <Icon name="plus" size={18} />
          </button>

          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0 shadow-lg shadow-blue-500/20"
            title="Gestionar Carpetas"
          >
            <Icon name="folder" size={18} />
          </button>

          <button
            onClick={() => setIsTagModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0 shadow-lg shadow-cyan-500/20"
            title="Gestionar Etiquetas"
          >
            <Icon name="tag" size={18} />
          </button>

          <div className="w-[1px] h-6 md:w-6 md:h-[1px] bg-white/15 my-0 md:my-1 shrink-0" />

          <button
            onClick={() => setIsAutomationsModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shrink-0 shadow-lg shadow-amber-500/20"
            title="Automatizaciones & Webhooks"
          >
            <span className="text-sm">⚡</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shrink-0 shadow-lg shadow-purple-500/20"
            title="Copiloto IA"
          >
            <span className="text-sm">✨</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0 shadow-lg shadow-cyan-500/20"
            title="Configuración de la Plataforma"
          >
            <Icon name="settings" size={18} />
          </button>
        </aside>

        {/* 3. LIENZO PRINCIPAL DEL ESPACIO DE TRABAJO */}
        <main className="flex-1 w-full glass-canvas p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 relative overflow-hidden">
          
          {/* Cabecera y Métricas */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Mi Espacio de Trabajo
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Centro modular unificado • Motor de Almacenamiento Dual • Procesamiento en Tiempo Real
                </p>
              </div>

              {/* Botón de Acción Rápida */}
              <button
                onClick={openCreateModal}
                className="glass-pill px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all self-start sm:self-auto"
              >
                <Icon name="plus" size={14} />
                <span>+ Nuevo Proyecto</span>
              </button>
            </div>

            {/* DIALES DE MÉTRICAS VINCULADOS A SISTEMAS REALES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Dial 1: Almacenamiento Real en la Nube (Cloudflare R2 + Supabase) */}
              <div className="glass-sub-card glass-glow-amber p-4 flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block truncate">
                      Almacenamiento en la Nube
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {systemMetrics.storage.usedFormatted}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      / {systemMetrics.storage.quotaFormatted}
                    </span>
                  </h3>
                  <p className="text-[10px] text-amber-200/80 truncate">
                    {systemMetrics.storage.statusText}
                  </p>
                </div>
                {/* Indicador de porcentaje real */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-500/30 flex items-center justify-center shrink-0 ml-2 bg-amber-950/30">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent border-r-transparent transition-all duration-700"
                    style={{ transform: `rotate(${Math.min(360, (systemMetrics.storage.percentage / 100) * 360)}deg)` }}
                  />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300">
                    {systemMetrics.storage.percentage}%
                  </span>
                </div>
              </div>

              {/* Dial 2: Servicio Worker Heavy Multimedia en Vivo */}
              <div className="glass-sub-card glass-glow-purple p-4 flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        systemMetrics.worker.isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                      }`}
                    />
                    <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block truncate">
                      Servicio Worker
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {systemMetrics.worker.service}
                  </h3>
                  <p className="text-[10px] text-purple-200/80 truncate">
                    {systemMetrics.worker.cpuLabel} • {systemMetrics.worker.statusLabel}
                  </p>
                </div>
                {/* Indicador de estado del Worker */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-purple-500/30 flex flex-col items-center justify-center shrink-0 ml-2 bg-purple-950/30 shadow-inner">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mb-0.5 ${
                      systemMetrics.worker.isOnline ? "bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono font-black ${
                      systemMetrics.worker.isOnline ? "text-emerald-300" : "text-red-400"
                    }`}
                  >
                    {systemMetrics.worker.isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
              </div>

              {/* Dial 3: Archivos Guardados y Base de Datos Real */}
              <div className="glass-sub-card glass-glow-cyan p-4 flex items-center justify-between sm:col-span-2 lg:col-span-1">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider block truncate">
                      Archivos Guardados
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {stats.totalAssets} Archivos
                  </h3>
                  <p className="text-[10px] text-cyan-200/80 truncate">
                    {stats.total} Proyectos • Supabase Sincronizado
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 ml-2">
                  <Icon name="folder" size={18} />
                </div>
              </div>

            </div>
          </div>

          {/* PESTAÑAS DE CARPETAS Y FILTROS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`glass-pill px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFolderId === null
                    ? "bg-white/20 text-white border-white/30 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Todos los proyectos ({stats.total})
              </button>

              {folders.map((f) => {
                const count = projects.filter((p) => p.folderId === f.id && !p.archived).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`glass-pill px-4 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      selectedFolderId === f.id
                        ? "bg-white/20 text-white border-white/30 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                    <span>{f.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Controles de Vista */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex glass-pill p-0.5">
                {(["all", "favorites", "archived"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full capitalize transition-all ${
                      filterTab === tab
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "all" ? "Todos" : tab === "favorites" ? "Favoritos" : "Archivados"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setLayoutView(layoutView === "grid" ? "list" : "grid")}
                className="glass-pill p-1.5 text-slate-300 hover:text-white"
                title="Cambiar modo de vista"
              >
                <Icon name={layoutView === "grid" ? "grid" : "list"} size={14} />
              </button>
            </div>
          </div>

          {/* CUADRÍCULA DE PROYECTOS */}
          <section className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="glass-sub-card p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                  <Icon name="folder" size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">No se encontraron proyectos</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ajusta tus filtros de búsqueda o haz clic abajo para crear tu primer proyecto modular.
                </p>
                <button
                  onClick={openCreateModal}
                  className="glass-pill px-5 py-2 text-xs font-bold text-amber-300 border-amber-500/30 hover:border-amber-500/60"
                >
                  + Crear Nuevo Proyecto
                </button>
              </div>
            ) : layoutView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {filteredProjects.map((p) => {
                  const folder = folders.find((f) => f.id === p.folderId);
                  const projectAssetCount = assets.filter((a) => a.projectId === p.id).length;

                  return (
                    <div
                      key={p.id}
                      onClick={() => openFileViewer(p.id)}
                      className="glass-sub-card p-5 cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden"
                    >
                      {/* Barra Superior */}
                      <div className="flex items-start justify-between gap-2">
                        {folder ? (
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 truncate max-w-[130px]"
                            style={{
                              backgroundColor: `${folder.color}15`,
                              borderColor: `${folder.color}35`,
                              color: folder.color,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                            <span className="truncate">{folder.name}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 border border-white/10">
                            General
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                            className={`p-1 rounded-lg transition-colors ${
                              p.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                            }`}
                            title="Favorito"
                          >
                            <Icon name="star" size={13} />
                          </button>
                          <button
                            onClick={(e) => openEditModal(p.id, e)}
                            className="p-1 text-slate-500 hover:text-white rounded-lg"
                            title="Editar"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); }}
                            className="p-1 text-slate-500 hover:text-white rounded-lg"
                            title="Duplicar"
                          >
                            <Icon name="copy" size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                            className="p-1 text-slate-500 hover:text-red-400 rounded-lg"
                            title="Archivar"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="space-y-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {p.description || "Sin descripción proporcionada."}
                        </p>

                        {/* Etiquetas del Proyecto */}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.tags.slice(0, 3).map((tagId) => {
                              const tagObj = tags.find((t) => t.id === tagId);
                              if (!tagObj) return null;
                              return (
                                <span
                                  key={tagObj.id}
                                  className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-semibold"
                                  style={{
                                    backgroundColor: `${tagObj.color}15`,
                                    color: tagObj.color,
                                    border: `1px solid ${tagObj.color}35`,
                                  }}
                                >
                                  #{tagObj.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Pie de Tarjeta */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                        <span className="glass-pill px-2.5 py-0.5 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Icon name="folder" size={11} />
                          {p.id === "proj-vault" ? "Bóveda Cifrada" : `${projectAssetCount} archivos`}
                        </span>

                        <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>{p.id === "proj-vault" ? "Abrir Bóveda" : "Explorar"}</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Vista en Lista */
              <div className="space-y-2.5">
                {filteredProjects.map((p) => {
                  const folder = folders.find((f) => f.id === p.folderId);
                  const projectAssetCount = assets.filter((a) => a.projectId === p.id).length;

                  return (
                    <div
                      key={p.id}
                      onClick={() => openFileViewer(p.id)}
                      className="glass-sub-card p-4 cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${p.color}20`,
                            border: `1px solid ${p.color}40`,
                          }}
                        >
                          <Icon name={p.id === "proj-vault" ? "shield" : "project"} size={18} style={{ color: p.color }} />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {p.description || "Proyecto modular"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {folder && (
                          <span
                            className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{
                              backgroundColor: `${folder.color}15`,
                              borderColor: `${folder.color}35`,
                              color: folder.color,
                            }}
                          >
                            {folder.name}
                          </span>
                        )}

                        <span className="glass-pill px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                          {p.id === "proj-vault" ? "Bóveda" : `${projectAssetCount} archivos`}
                        </span>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                          className={`p-1 rounded-lg ${p.isFavorite ? "text-amber-400" : "text-slate-500"}`}
                        >
                          <Icon name="star" size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ETIQUETAS FOOTER */}
          <div className="pt-4 border-t border-white/5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Etiquetas:</span>
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTagId(selectedTagId === t.id ? null : t.id)}
                className={`glass-pill px-3 py-1 text-[11px] font-semibold transition-all ${
                  selectedTagId === t.id
                    ? "bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>

        </main>
      </div>

      {/* ALL MODALS & SPATIAL DRAWERS */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectId={selectedProjectId}
      />
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <FileViewerModal
        isOpen={fileViewerProjectId !== null}
        onClose={() => setFileViewerProjectId(null)}
        projectId={fileViewerProjectId}
      />

      {/* Global Background Job Queue Drawer */}
      <JobQueueDrawer />

      {/* Automations & Webhook Rules Modal */}
      <AutomationsModal />

      {/* AI Copilot & Document Generator Drawer */}
      <AiAssistantDrawer />

      {/* CipherVault Zero-Knowledge Password & Secrets Manager */}
      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />

    </div>
  );
}
