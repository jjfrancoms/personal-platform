"use client";

import React, { useState, useMemo } from "react";
import { GlassButton, Icon } from "@personal-platform/ui";
import { NbtNode, NbtProcessor } from "@personal-platform/processors";

interface NbtTreeViewerProps {
  filename: string;
}

const SAMPLE_NBT_ROOT: NbtNode = {
  name: "Data",
  type: "TAG_Compound",
  children: [
    {
      name: "Player",
      type: "TAG_Compound",
      children: [
        { name: "Health", type: "TAG_Float", value: 20.0 },
        { name: "FoodLevel", type: "TAG_Int", value: 20 },
        { name: "Score", type: "TAG_Int", value: 14500 },
        { name: "XpLevel", type: "TAG_Int", value: 42 },
        {
          name: "Pos",
          type: "TAG_List",
          children: [
            { name: "0", type: "TAG_Double", value: 128.45 },
            { name: "1", type: "TAG_Double", value: 64.0 },
            { name: "2", type: "TAG_Double", value: -320.12 },
          ],
        },
        {
          name: "Inventory",
          type: "TAG_List",
          children: [
            {
              name: "Slot 0",
              type: "TAG_Compound",
              children: [
                { name: "id", type: "TAG_String", value: "minecraft:netherite_sword" },
                { name: "Count", type: "TAG_Byte", value: 1 },
                {
                  name: "tag",
                  type: "TAG_Compound",
                  children: [
                    { name: "Damage", type: "TAG_Int", value: 0 },
                    {
                      name: "Enchantments",
                      type: "TAG_List",
                      children: [
                        {
                          name: "0",
                          type: "TAG_Compound",
                          children: [
                            { name: "id", type: "TAG_String", value: "minecraft:sharpness" },
                            { name: "lvl", type: "TAG_Short", value: 5 },
                          ],
                        },
                        {
                          name: "1",
                          type: "TAG_Compound",
                          children: [
                            { name: "id", type: "TAG_String", value: "minecraft:unbreaking" },
                            { name: "lvl", type: "TAG_Short", value: 3 },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "Slot 1",
              type: "TAG_Compound",
              children: [
                { name: "id", type: "TAG_String", value: "minecraft:golden_apple" },
                { name: "Count", type: "TAG_Byte", value: 64 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "WorldSettings",
      type: "TAG_Compound",
      children: [
        { name: "LevelName", type: "TAG_String", value: "Survival World 2026" },
        { name: "Difficulty", type: "TAG_Byte", value: 3 },
        { name: "DayTime", type: "TAG_Long", value: 184500 },
        { name: "Raining", type: "TAG_Byte", value: 0 },
      ],
    },
  ],
};

export const NbtTreeViewer: React.FC<NbtTreeViewerProps> = ({ filename }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_NBT_ROOT;
    return NbtProcessor.searchTree(SAMPLE_NBT_ROOT, searchQuery);
  }, [searchQuery]);

  const handleExportJson = () => {
    const json = NbtProcessor.toJson(SAMPLE_NBT_ROOT);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.(nbt|dat)$/i, ".json");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase text-[10px]">
            NBT TREE
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NBT tag name or value..."
              className="pl-7 pr-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white outline-none w-56 focus:border-purple-500/50"
            />
            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 pointer-events-none">
              <Icon name="search" size={12} />
            </span>
          </div>
        </div>

        <GlassButton onClick={handleExportJson} variant="secondary" size="sm" className="text-xs py-1">
          Export JSON
        </GlassButton>
      </div>

      {/* Tree Viewport */}
      <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-slate-950/70 p-4 font-mono text-xs text-slate-200">
        {filteredTree ? (
          <NbtNodeItem node={filteredTree} depth={0} />
        ) : (
          <p className="text-slate-500 italic p-4 text-center">No matching NBT tags found.</p>
        )}
      </div>
    </div>
  );
};

const NbtNodeItem: React.FC<{ node: NbtNode; depth: number }> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 3);
  const hasChildren = node.children && node.children.length > 0;

  const tagColor =
    node.type === "TAG_Compound"
      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
      : node.type === "TAG_List"
      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
      : node.type === "TAG_String"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : node.type.includes("Int") || node.type.includes("Short")
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";

  return (
    <div className="space-y-1">
      <div
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 py-0.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors ${
          hasChildren ? "cursor-pointer select-none" : ""
        }`}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        {hasChildren ? (
          <span className="text-slate-400 text-[10px] w-3">{isExpanded ? "▼" : "▶"}</span>
        ) : (
          <span className="w-3" />
        )}

        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border uppercase ${tagColor}`}>
          {node.type.replace("TAG_", "")}
        </span>

        <span className="font-bold text-white">{node.name}:</span>

        {node.value !== undefined && (
          <span className="text-cyan-300">
            {typeof node.value === "string" ? `"${node.value}"` : String(node.value)}
          </span>
        )}

        {hasChildren && !isExpanded && (
          <span className="text-[10px] text-slate-500 italic">({node.children?.length} items)</span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children?.map((child, idx) => (
            <NbtNodeItem key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
