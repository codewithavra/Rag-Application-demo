/**
 * Node Imports
 */
import mongoose, { Schema } from "mongoose";
/**
 * Types
 */
import type { IDocumentChunk } from "../types";


const documentChunkSchema = new Schema<IDocumentChunk>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast chunk retrieval per document in order
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export const DocumentChunkModel = mongoose.model<IDocumentChunk>("DocumentChunk", documentChunkSchema);