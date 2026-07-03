import { DocumentChunkModel } from "../models";

const SCORE_THRESHOLD = 0.75;
const TOP_K = 8;
const NUM_CANDIDATES = 150;

export async function retrieveRelevantChunks(userId: string, queryVector: number[]) {
  const results = await DocumentChunkModel.aggregate([
    {
      $vectorSearch: {
        index: "document_chunk_vector_index",
        path: "embedding",
        queryVector,
        numCandidates: NUM_CANDIDATES,
        limit: TOP_K,
        filter: { userId },
      },
    },
    {
      $project: {
        documentId: 1,
        fileName: 1,
        text: 1,
        chunkIndex: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // always returns an array — filter low-relevance chunks
  return results.filter((chunk) => chunk.score >= SCORE_THRESHOLD);
}