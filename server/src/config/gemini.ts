/**
 * Node Imports
 */
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

/**
 * Other Imports
 */
import { env } from "./env";


export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: env.EMBEDDING_MODEL,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});