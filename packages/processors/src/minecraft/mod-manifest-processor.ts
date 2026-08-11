export interface MinecraftModManifest {
  modId: string;
  name: string;
  version: string;
  loader: "fabric" | "forge" | "neoforge" | "quilt";
  mcVersion: string;
  description: string;
  authors: string[];
  license?: string;
  dependencies: { id: string; versionRange: string }[];
  mixins?: string[];
}

export class ModManifestProcessor {
  /**
   * Parses Fabric fabric.mod.json format
   */
  static parseFabric(jsonString: string): MinecraftModManifest {
    const raw = JSON.parse(jsonString);
    const deps = Object.entries(raw.depends || {}).map(([id, range]) => ({
      id,
      versionRange: String(range),
    }));

    return {
      modId: raw.id || "unknown",
      name: raw.name || raw.id || "Unknown Mod",
      version: raw.version || "1.0.0",
      loader: "fabric",
      mcVersion: raw.depends?.minecraft || "*",
      description: raw.description || "",
      authors: Array.isArray(raw.authors)
        ? raw.authors.map((a: any) => (typeof a === "string" ? a : a.name))
        : [],
      license: raw.license || "All Rights Reserved",
      dependencies: deps,
      mixins: Array.isArray(raw.mixins) ? raw.mixins : [],
    };
  }
}
