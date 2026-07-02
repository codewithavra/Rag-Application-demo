/**
 * Node Imports
 */
import { ChatGroq } from "@langchain/groq"

export const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    maxTokens: 1024,
    maxRetries: 2,
})