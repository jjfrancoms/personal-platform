import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  color: string;
  isFavorite: boolean;
  archived: boolean;
  folderId?: string;
  tags: string[]; // Tag IDs
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  projectName: string;
  timestamp: string;
}

interface ProjectState {
  projects: Project[];
  tags: Tag[];
  folders: Folder[];
  activityLogs: ActivityLog[];
  
  // UI filter states
  searchQuery: string;
  selectedTagId: string | null;
  selectedFolderId: string | null;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  filterTab: "all" | "favorites" | "archived";
  layoutView: "grid" | "list";

  // Actions
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "archived">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void; // Soft delete (archives)
  hardDeleteProject: (id: string) => void; // Permanent delete
  duplicateProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  restoreProject: (id: string) => void; // Unarchives
  addTag: (tag: Omit<Tag, "id">) => void;
  addFolder: (folder: Omit<Folder, "id">) => void;
  logActivity: (action: string, projectName: string) => void;
  
  // UI Setters
  setSearchQuery: (query: string) => void;
  setSelectedTagId: (tagId: string | null) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSortBy: (sortBy: "name" | "createdAt" | "updatedAt") => void;
  toggleSortOrder: () => void;
  setFilterTab: (tab: "all" | "favorites" | "archived") => void;
  setLayoutView: (view: "grid" | "list") => void;
}

const DEFAULT_TAGS: Tag[] = [
  { id: "tag-1", name: "Minecraft", color: "#22c55e" },
  { id: "tag-2", name: "3D Graphics", color: "#a855f7" },
  { id: "tag-3", name: "Utilities", color: "#3b82f6" },
  { id: "tag-4", name: "Heavy Worker", color: "#ec4899" },
  { id: "tag-5", name: "Java", color: "#f97316" },
  { id: "tag-6", name: "Docker", color: "#06b6d4" },
];

const DEFAULT_FOLDERS: Folder[] = [
  { id: "folder-1", name: "Gaming Tools", color: "#22c55e" },
  { id: "folder-2", name: "Media Assets", color: "#ec4899" },
  { id: "folder-3", name: "Data Processing", color: "#3b82f6" },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Minecraft Mod Inspector",
    description: "Inspect bbmodels, inspect skin PNG assets, JAR mod contents, and read NBT datatrees natively.",
    color: "#22c55e",
    isFavorite: true,
    archived: false,
    folderId: "folder-1",
    tags: ["tag-1", "tag-5"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj-2",
    name: "3D Asset Converter",
    description: "Web based batch converter for FBX, OBJ, STL, GLTF, and GLB files with visual 3D preview renderers.",
    color: "#a855f7",
    isFavorite: true,
    archived: false,
    folderId: "folder-2",
    tags: ["tag-2"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj-3",
    name: "CSV & JSON Parser",
    description: "Lightweight structured data visualization and mapping utility for rapid format conversions.",
    color: "#3b82f6",
    isFavorite: false,
    archived: false,
    folderId: "folder-3",
    tags: ["tag-3"],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj-4",
    name: "Async Video Compresser",
    description: "FFmpeg pipeline inside isolated Node.js docker worker to crush video file sizes asynchronously.",
    color: "#ec4899",
    isFavorite: false,
    archived: false,
    folderId: "folder-2",
    tags: ["tag-4", "tag-6"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_LOGS: ActivityLog[] = [
  { id: "log-1", action: "Created Project", projectName: "Minecraft Mod Inspector", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "log-2", action: "Created Project", projectName: "3D Asset Converter", timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "log-3", action: "Updated Project", projectName: "Minecraft Mod Inspector", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: DEFAULT_PROJECTS,
      tags: DEFAULT_TAGS,
      folders: DEFAULT_FOLDERS,
      activityLogs: DEFAULT_LOGS,
      
      searchQuery: "",
      selectedTagId: null,
      selectedFolderId: null,
      sortBy: "updatedAt",
      sortOrder: "desc",
      filterTab: "all",
      layoutView: "grid",

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: `proj-${Math.random().toString(36).substr(2, 9)}`,
          archived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        get().logActivity("Created Project", newProject.name);
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
        const updatedProject = get().projects.find((p) => p.id === id);
        if (updatedProject) {
          get().logActivity("Updated Project", updatedProject.name);
        }
      },

      deleteProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          get().updateProject(id, { archived: true });
          get().logActivity("Archived Project", project.name);
        }
      },

      hardDeleteProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
          }));
          get().logActivity("Permanently Deleted Project", project.name);
        }
      },

      duplicateProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          const duplicated: Project = {
            ...project,
            id: `proj-${Math.random().toString(36).substr(2, 9)}`,
            name: `${project.name} (Copy)`,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            projects: [...state.projects, duplicated],
          }));
          get().logActivity("Duplicated Project", project.name);
        }
      },

      toggleFavorite: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          get().updateProject(id, { isFavorite: !project.isFavorite });
          get().logActivity(
            project.isFavorite ? "Removed from Favorites" : "Added to Favorites",
            project.name
          );
        }
      },

      restoreProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          get().updateProject(id, { archived: false });
          get().logActivity("Restored Project", project.name);
        }
      },

      addTag: (tagData) => {
        const newTag: Tag = {
          ...tagData,
          id: `tag-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          tags: [...state.tags, newTag],
        }));
      },

      addFolder: (folderData) => {
        const newFolder: Folder = {
          ...folderData,
          id: `folder-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          folders: [...state.folders, newFolder],
        }));
      },

      logActivity: (action, projectName) => {
        const newLog: ActivityLog = {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          action,
          projectName,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs].slice(0, 50), // Keep last 50 logs
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTagId: (selectedTagId) => set({ selectedTagId }),
      setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),
      setSortBy: (sortBy) => set({ sortBy }),
      toggleSortOrder: () =>
        set((state) => ({ sortOrder: state.sortOrder === "asc" ? "desc" : "asc" })),
      setFilterTab: (filterTab) => set({ filterTab }),
      setLayoutView: (layoutView) => set({ layoutView }),
    }),
    {
      name: "personal-platform-projects",
      partialize: (state) => ({
        projects: state.projects,
        tags: state.tags,
        folders: state.folders,
        activityLogs: state.activityLogs,
        layoutView: state.layoutView,
      }),
    }
  )
);
