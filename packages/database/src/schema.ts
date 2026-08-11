import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, bigint } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  color: text("color").default("#3b82f6"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  archivedAt: timestamp("archived_at"), // Soft delete support
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color"),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectTags = pgTable("project_tags", {
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
});

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  storageKey: text("storage_key").notNull(),
  storageProvider: text("storage_provider").default("supabase").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  checksum: text("checksum"),
  isPrivate: boolean("is_private").default(false).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
  currentVersion: integer("current_version").default(1).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assetVersions = pgTable("asset_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  storageKey: text("storage_key").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  mimeType: text("mime_type").notNull(),
  changeSummary: text("change_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
  type: text("type").notNull(), // video_compress, audio_convert, video_to_gif, extract_thumbnail
  status: text("status").default("pending").notNull(), // pending, queued, processing, completed, failed
  progress: integer("progress").default(0).notNull(),
  inputKey: text("input_key").notNull(),
  outputKey: text("output_key"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const conversions = pgTable("conversions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceAssetId: uuid("source_asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  targetFormat: text("target_format").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversionOutputs = pgTable("conversion_outputs", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversionId: uuid("conversion_id").references(() => conversions.id, { onDelete: "cascade" }).notNull(),
  outputAssetId: uuid("output_asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").references(() => profiles.id).primaryKey().notNull(),
  theme: text("theme").default("dark").notNull(),
  layout: text("layout").default("grid").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vaultItems = pgTable("vault_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").default("login").notNull(), // login, card, note, api_key, server
  username: text("username"),
  encryptedData: text("encrypted_data").notNull(), // AES-256-GCM encrypted payload (password, notes, totp, fields)
  iv: text("iv").notNull(),
  salt: text("salt").notNull(),
  websiteUrl: text("website_url"),
  icon: text("icon"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type ProjectTag = typeof projectTags.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type AssetVersion = typeof assetVersions.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Conversion = typeof conversions.$inferSelect;
export type ConversionOutput = typeof conversionOutputs.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type VaultItem = typeof vaultItems.$inferSelect;

