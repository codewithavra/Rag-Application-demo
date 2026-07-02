/**
 * Node Imports
 */

import { embeddings } from "../config";

/**
 * Other Imports
 */

/**
 * Embed a single string — used for query embedding in similarity search
 */

export const embedText = async (text: string): Promise<number[]> => {
  const vector = await embeddings.embedQuery(text);
  return vector;
};

/**
 * Embed multiple strings in batches — used during ingestion
 */

export const embedTexts = async (
  text: string[],
  batchSize = 10,
): Promise<number[][]> => {
  const result: number[][] = [];
  for (let i = 0; i< text.length; i++) {
    const batch = text.slice(i, i + batchSize);
    const vectors = await embeddings.embedDocuments(batch);
    result.push(...vectors);

    if (i + batchSize < text.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return result;
};
