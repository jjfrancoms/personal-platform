export interface DocumentStats {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
}

export class DocumentProcessor {
  /**
   * Computes word count, character count, and estimated reading time
   */
  static extractStats(text: string): DocumentStats {
    const cleanText = text.trim();
    if (!cleanText) {
      return { wordCount: 0, charCount: 0, paragraphCount: 0, readingTimeMinutes: 0 };
    }

    const words = cleanText.split(/\s+/).filter(Boolean);
    const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean);
    const readingTime = Math.max(1, Math.ceil(words.length / 200));

    return {
      wordCount: words.length,
      charCount: cleanText.length,
      paragraphCount: paragraphs.length,
      readingTimeMinutes: readingTime,
    };
  }
}
