export type NbtTagType =
  | "TAG_End"
  | "TAG_Byte"
  | "TAG_Short"
  | "TAG_Int"
  | "TAG_Long"
  | "TAG_Float"
  | "TAG_Double"
  | "TAG_Byte_Array"
  | "TAG_String"
  | "TAG_List"
  | "TAG_Compound"
  | "TAG_Int_Array"
  | "TAG_Long_Array";

export interface NbtNode {
  name: string;
  type: NbtTagType;
  value?: any;
  children?: NbtNode[];
}

export class NbtProcessor {
  /**
   * Filters NBT tree by tag name or value query
   */
  static searchTree(node: NbtNode, query: string): NbtNode | null {
    const q = query.toLowerCase();
    const matchesSelf =
      node.name.toLowerCase().includes(q) ||
      (node.value !== undefined && String(node.value).toLowerCase().includes(q));

    if (!node.children || node.children.length === 0) {
      return matchesSelf ? node : null;
    }

    const filteredChildren: NbtNode[] = [];
    for (const child of node.children) {
      const match = this.searchTree(child, query);
      if (match) filteredChildren.push(match);
    }

    if (matchesSelf || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  }

  /**
   * Converts NBT node tree to standard JSON
   */
  static toJson(node: NbtNode): Record<string, any> {
    if (node.type === "TAG_Compound") {
      const obj: Record<string, any> = {};
      node.children?.forEach((child) => {
        obj[child.name] = this.toJson(child);
      });
      return obj;
    }
    if (node.type === "TAG_List") {
      return node.children ? node.children.map((c) => this.toJson(c)) : [];
    }
    return node.value;
  }
}
