import { Worker, type Job } from "bullmq";
import { DocumentModel } from "../models";
import {
  embedTexts,
  fileParser,
  splitTextIntoChunks,
  vectorStore,
} from "../services";
import type { ChunkDocument } from "../types";
import { unlink } from "node:fs/promises";
import { ioRedisConnection } from "../config";
import { ingestionQueue } from "../queues/ingest.queue";

const CONCURRENCY = 3;

// ── Core job handler ─────────────────────────────────────────────────────────
async function processDocumentJob(job: Job): Promise<void> {
  const { documentId, userId, filePath, fileType, fileName } = job.data;

  console.log(
    `[worker] ▶ Starting job for document ${documentId} (${fileName})`,
  );
  await DocumentModel.findByIdAndUpdate(documentId, {
    status: "processing",
  });

  try {
    // 1. Parse the file into raw text + metadata using your fileParser service
    const parsed = await fileParser(fileName, filePath, fileType);

    if (!parsed.text.trim()) {
      throw new Error("No extractable text found in file");
    }

    // 2. Chunk the text using your splitTextIntoChunks service
    const chunks = await splitTextIntoChunks(parsed.text);

    if (chunks.length === 0) {
      throw new Error("Text splitting produced zero chunks");
    }

    await job.updateProgress(30); // parsing + chunking done

    // 3. Embed all chunks using your embedTexts service (batched internally)

    const vectors = await embedTexts(chunks);

    if (vectors.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch: got ${vectors.length} vectors for ${chunks.length} chunks`,
      );
    }

    await job.updateProgress(70); // embeddings done

    // 4. Filter out any undefined slots (TypeScript: embedTexts returns number[]|undefined per slot)
    //    This is a runtime safety net; once the embedTexts loop bug is fixed
    //    (`i < text.length` instead of `text.length`) this filter will never drop anything.
    const paired = chunks
      .map((chunk, idx) => ({ chunk, vector: vectors[idx] }))
      .filter((p): p is { chunk: string; vector: number[] } => Array.isArray(p.vector));
 
    if (paired.length === 0) {
      throw new Error("All embeddings came back undefined — check the embedTexts loop condition");
    }
 
    // 5. Build flat documents matching DocumentChunkModel field names exactly.
    //    Flat structure (no nested metadata) is required because DocumentChunk
    //    stores userId, documentId, fileName etc. as top-level fields.
    const documents: ChunkDocument[] = paired.map(({ chunk, vector }, idx) => ({
      text: chunk,
      embedding: vector,
      userId,
      documentId,
      fileName: parsed.metadata.fileName,
      fileType: parsed.metadata.fileType,
      chunkIndex: idx,
      source: parsed.metadata.source,
      charCount: chunk.length,
    }));

    // 5. Store in MongoDB via your vectorStore factory
    const store = await vectorStore();

    // addDocuments() on MongoDBAtlasVectorSearch expects LangChain Document objects:
    // { pageContent: string, metadata: Record<string, any> }
    // It handles embedding internally IF you pass pageContent — but since you're
    // pre-computing embeddings above, use the lower-level collection.insertMany instead
    // to avoid double-embedding and to keep your batching/rate-limit logic.
    // Access the underlying collection via the store's internal _collection field.
    const collection = (store as any)._collection;
    await collection.insertMany(documents);

    await job.updateProgress(100);

    // 6. Update DB record
    await DocumentModel.findByIdAndUpdate(documentId, {
      chunkCount : chunks.length
    })
    await DocumentModel.findByIdAndUpdate(documentId, {
      status : "completed"
    })

    console.log(
      `[worker] ✅ Completed document ${documentId}: ${chunks.length} chunks embedded`,
    );
  } catch (err: any) {
    console.error(
      `[worker] ❌ Failed document ${documentId}:`,
      err?.message ?? err,
    );

    await DocumentModel.findByIdAndUpdate(documentId, {
      error : "Unknown error"
    })
    throw err; // re-throw so BullMQ applies retry/backoff from queue defaultJobOptions
  } finally {
    // Always clean up the temp file, regardless of success or failure
    await unlink(filePath).catch(() =>
      console.warn(`[worker] Could not delete temp file: ${filePath}`),
    );
  }
}

// ── Spin up the worker ───────────────────────────────────────────────────────
const worker = new Worker(
  ingestionQueue.name,
  processDocumentJob,
  {
    connection: ioRedisConnection as any,
    concurrency: CONCURRENCY,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[worker] Job ${job?.id} failed (${job?.attemptsMade} attempts):`,
    err.message,
  );
});

worker.on("progress", (job, progress) => {
  console.log(`[worker] Job ${job.id} progress: ${progress}%`);
});

console.log(
  `🚀 Document processing worker started (concurrency: ${CONCURRENCY})`,
);

// ── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`${signal} received — draining worker...`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
