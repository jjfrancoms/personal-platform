import Papa from "papaparse";
import { CsvParseResult } from "../types";

export class CsvProcessor {
  /**
   * Parses CSV string into structured headers and records
   */
  static parse(csvString: string): CsvParseResult {
    const parsed = Papa.parse<Record<string, any>>(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const headers = parsed.meta.fields || [];
    const rows = parsed.data || [];
    const errors = parsed.errors.map((e) => `Row ${e.row}: ${e.message}`);

    return {
      headers,
      rows,
      totalRows: rows.length,
      errors,
    };
  }

  /**
   * Converts CSV string directly into a JSON formatted string
   */
  static toJson(csvString: string, pretty = true): string {
    const result = this.parse(csvString);
    return pretty
      ? JSON.stringify(result.rows, null, 2)
      : JSON.stringify(result.rows);
  }

  /**
   * Converts JSON array back into a CSV string
   */
  static fromJson(jsonArray: Record<string, any>[]): string {
    return Papa.unparse(jsonArray);
  }
}
