/**
 * Node Imports
 */
import mongoose, { Schema } from "mongoose";


/**
 * Types
 */
import type { IChat, PersonaKey } from "../types";
 



const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    persona: {
      type: String,
      enum: ["default", "concise", "expert", "friendly", "socratic"],
      default: "default",
    },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);
