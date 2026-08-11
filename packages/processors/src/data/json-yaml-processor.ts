export class JsonYamlProcessor {
  /**
   * Formats and prettifies a JSON string
   */
  static formatJson(jsonString: string, indent = 2): { success: boolean; formatted: string; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        success: true,
        formatted: JSON.stringify(parsed, null, indent),
      };
    } catch (err: any) {
      return {
        success: false,
        formatted: jsonString,
        error: err?.message || "Invalid JSON syntax",
      };
    }
  }

  /**
   * Simple and fast in-browser JSON to YAML serialization
   */
  static jsonToYaml(jsonObject: any, indent = 0): string {
    const spaces = " ".repeat(indent);
    
    if (jsonObject === null || jsonObject === undefined) {
      return "null\n";
    }
    if (typeof jsonObject !== "object") {
      return typeof jsonObject === "string" ? `"${jsonObject}"\n` : `${jsonObject}\n`;
    }

    if (Array.isArray(jsonObject)) {
      if (jsonObject.length === 0) return "[]\n";
      return jsonObject
        .map((item) => `${spaces}- ${this.jsonToYaml(item, indent + 2).trimStart()}`)
        .join("");
    }

    const keys = Object.keys(jsonObject);
    if (keys.length === 0) return "{}\n";

    return keys
      .map((key) => {
        const val = jsonObject[key];
        if (val !== null && typeof val === "object") {
          return `${spaces}${key}:\n${this.jsonToYaml(val, indent + 2)}`;
        }
        return `${spaces}${key}: ${this.jsonToYaml(val, 0)}`;
      })
      .join("");
  }

  /**
   * Prettifies XML strings with indentation
   */
  static formatXml(xml: string): string {
    let formatted = "";
    let indent = "";
    const tab = "  ";
    xml.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
      formatted += indent + "<" + node + ">\r\n";
      if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
    });
    return formatted.substring(1, formatted.length - 3);
  }
}
