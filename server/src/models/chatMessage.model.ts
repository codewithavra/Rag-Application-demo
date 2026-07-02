import mongoose, { Schema } from "mongoose";
import type { IChatMessage } from "../types";


const chatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [
      {
        documentId: {
          type: Schema.Types.ObjectId,
          ref: "Document",
        },
        filename: String,
        text: String,
        score: Number,
      },
    ],
  },
  { timestamps: true }
);

// Efficient history fetch: all messages for a chat in order
chatMessageSchema.index({ chatId: 1, createdAt: 1 });

export const ChatMessageModel = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);