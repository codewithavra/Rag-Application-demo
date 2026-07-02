/**
 * Other Imports
 */
import { DocumentChunkModel } from "../models";


export async function retrieveRelevantChunks(userId: string, queryVector: number[]) {
  return DocumentChunkModel.aggregate([
    {
      $vectorSearch: {
        index: "document_chunk_vector_index",
        path: "embedding",
        queryVector,
        numCandidates: 100,
        limit: 5,
        filter: {
          userId
        }
      }
    },
    {
      $project: {
        documentId: 1,
        filename: 1,
        text: 1,
        score: {
          $meta: "vectorSearchScore"
        }
      }
    }
  ]);
}