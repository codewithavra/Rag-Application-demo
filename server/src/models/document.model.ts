/**
 * Node Imports
 */
import mongoose, { Schema } from "mongoose";

/**
 * Types
 */
import type { IDocument } from "../types";



const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "ready", "failed"],
      default: "queued",
      index: true,
    },
    error: {
      type: String,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>("Document", documentSchema);