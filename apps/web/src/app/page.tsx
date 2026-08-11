"use client";

import React, { useState, useMemo } from "react";
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
  const [fileViewerProjectId, setFileViewerProjectId] = useState<string | null>(null);

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
    setFileViewerProjectId(id);
  };

  return (
    <div className="min-h-screen w-full p-3 sm:p-5 lg:p-6 flex flex-col items-stretch justify-start relative">
      
      {/* 1. TOP FLOATING BROWSER / SEARCH & PROFILE CAPSULE (Full-Width Responsive Bar) */}
      <header className="w-full mb-4 sm:mb-6 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Search Container */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Brand Capsule */}
          <div className="glass-pill px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <span className="text-xs font-black text-white">P</span>
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-white leading-none">Personal Platform</h1>
                <p className="text-[9px] text-amber-300/80 font-medium tracking-wider uppercase">Spatial Frosted Studio</p>
              </div>
            </div>
            <span className="sm:hidden px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {stats.total} Projects
            </span>
          </div>

          {/* Global Search Capsule */}
          <div className="relative w-full sm:w-80 md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, assets, tools..."
              className="w-full pl-9 pr-4 py-2 glass-pill text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400/50 transition-all"
            />
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Icon name="search" size={13} />
            </span>
          </div>
        </div>

        {/* Header Right Actions (Pills Grid/Flex) */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full lg:w-auto">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-violet-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <span>✨</span>
            <span className="hidden xs:inline">AI Copilot</span>
          </button>

          <button
            onClick={() => setIsAutomationsModalOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-amber-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <span>⚡</span>
            <span className="hidden xs:inline">Automations</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-cyan-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Icon name="settings" size={13} />
            <span className="hidden xs:inline">Settings</span>
          </button>

          {/* Profile pill */}
          <div className="glass-pill pl-1.5 pr-3.5 py-1 sm:py-1.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow shrink-0">
              JD
            </div>
            <span className="text-xs font-semibold text-white hidden sm:inline">John Doe</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER WITH DETACHED FLOATING DOCK (Full Viewport Spread) */}
      <div className="w-full flex-1 flex flex-col md:flex-row items-start gap-4 lg:gap-6 relative">
        
        {/* DETACHED FLOATING ISLAND DOCK (Responsive Capsule Navigation) */}
        <aside className="glass-dock-pill py-3 px-4 md:py-6 md:px-3.5 flex flex-row md:flex-col items-center justify-around md:justify-start gap-3 md:gap-5 w-full md:w-auto shrink-0 sticky top-3 md:top-20 z-30 shadow-2xl">
          <button
            onClick={() => { setSelectedFolderId(null); setSelectedTagId(null); }}
            className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 transition-all shrink-0"
            title="Dashboard Overview"
          >
            <Icon name="dashboard" size={18} />
          </button>

          <button
            onClick={openCreateModal}
            className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/[0.08] hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 shrink-0"
            title="Create New Project"
          >
            <Icon name="plus" size={18} />
          </button>

          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/[0.08] hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 shrink-0"
            title="Manage Folders"
          >
            <Icon name="folder" size={18} />
          </button>

          <button
            onClick={() => setIsTagModalOpen(true)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/[0.08] hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 shrink-0"
            title="Manage Tags"
          >
            <Icon name="tag" size={18} />
          </button>

          <div className="w-[1px] h-6 md:w-6 md:h-[1px] bg-white/15 my-0 md:my-1 shrink-0" />

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center hover:scale-105 transition-all shrink-0"
            title="AI Documentation Assistant"
          >
            <span className="text-sm">✨</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/[0.08] hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shrink-0"
            title="Settings Hub"
          >
            <Icon name="settings" size={18} />
          </button>
        </aside>

        {/* 3. GRAND MASTER FROSTED GLASS CANVAS (Expands across 100% width) */}
        <main className="flex-1 w-full glass-canvas p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 relative overflow-hidden">
          
          {/* Spatial Header & Circular Metric Dials */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  My Workspace
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unified modular hub • Dual Storage Engine • Real-Time Pipelines
                </p>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={openCreateModal}
                className="glass-pill px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all self-start sm:self-auto"
              >
                <Icon name="plus" size={14} />
                <span>New Project Module</span>
              </button>
            </div>

            {/* TOP METRICS GLASS DIALS (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Dial 1: Storage Quota & Provider (Amber Glow) */}
              <div className="glass-sub-card glass-glow-amber p-4 flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block truncate">Cloud Storage</span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">4.8 GB <span className="text-xs font-normal text-slate-400">/ 50 GB</span></h3>
                  <p className="text-[10px] text-amber-200/80 truncate">Supabase + Cloudflare R2 Active</p>
                </div>
                {/* Circular Gauge Graphic */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-amber-500/30 flex items-center justify-center shrink-0 ml-2">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent border-r-transparent rotate-45" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-white">10%</span>
                </div>
              </div>

              {/* Dial 2: Asynchronous Worker Queue (Purple Glow) */}
              <div className="glass-sub-card glass-glow-purple p-4 flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block truncate">Worker Service</span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">FFmpeg 2026</h3>
                  <p className="text-[10px] text-purple-200/80 truncate">4 Concurrent Nodes • Ready</p>
                </div>
                {/* Circular Gauge Graphic */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-purple-500/30 flex items-center justify-center shrink-0 ml-2">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-b-transparent -rotate-45" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-300">100%</span>
                </div>
              </div>

              {/* Dial 3: Total Assets & Revisions (Cyan Glow) */}
              <div className="glass-sub-card glass-glow-cyan p-4 flex items-center justify-between sm:col-span-2 lg:col-span-1">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider block truncate">Stored Assets</span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">{stats.totalAssets} Files</h3>
                  <p className="text-[10px] text-cyan-200/80 truncate">{stats.total} Projects • Non-Destructive</p>
                </div>
                {/* Circular Indicator */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 ml-2">
                  <Icon name="folder" size={18} />
                </div>
              </div>

            </div>
          </div>

          {/* FOLDERS & CATEGORIES PILL TABS */}
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
                All Projects ({stats.total})
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

            {/* View Mode & Filter Controls */}
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
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setLayoutView(layoutView === "grid" ? "list" : "grid")}
                className="glass-pill p-1.5 text-slate-300 hover:text-white"
                title="Toggle View Mode"
              >
                <Icon name={layoutView === "grid" ? "grid" : "list"} size={14} />
              </button>
            </div>
          </div>

          {/* PROJECT CARDS SHOWCASE (Full-Width Responsive 1-2-3-4-5 Columns Grid) */}
          <section className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="glass-sub-card p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                  <Icon name="folder" size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">No projects found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your filters or click below to create your first modular workspace.
                </p>
                <button
                  onClick={openCreateModal}
                  className="glass-pill px-5 py-2 text-xs font-bold text-amber-300 border-amber-500/30 hover:border-amber-500/60"
                >
                  + Create New Project
                </button>
              </div>
            ) : layoutView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
                {filteredProjects.map((p) => {
                  const folder = folders.find((f) => f.id === p.folderId);
                  const projectAssetCount = assets.filter((a) => a.projectId === p.id).length;

                  return (
                    <div
                      key={p.id}
                      onClick={() => openFileViewer(p.id)}
                      className="glass-sub-card p-5 cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden"
                    >
                      {/* Top Meta Bar */}
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
                            title="Favorite"
                          >
                            <Icon name="star" size={13} />
                          </button>
                          <button
                            onClick={(e) => openEditModal(p.id, e)}
                            className="p-1 text-slate-500 hover:text-white rounded-lg"
                            title="Edit"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); }}
                            className="p-1 text-slate-500 hover:text-white rounded-lg"
                            title="Duplicate"
                          >
                            <Icon name="copy" size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                            className="p-1 text-slate-500 hover:text-red-400 rounded-lg"
                            title="Archive"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {p.description || "No project description provided."}
                        </p>
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                        <span className="glass-pill px-2.5 py-0.5 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Icon name="folder" size={11} />
                          {projectAssetCount} assets
                        </span>

                        <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Explore</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
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
                          <Icon name="project" size={18} style={{ color: p.color }} />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {p.description || "Modular workspace project"}
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
                          {projectAssetCount} files
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

          {/* TAGS FILTER FOOTER PILLS */}
          <div className="pt-4 border-t border-white/5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tags:</span>
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

    </div>
  );
}
