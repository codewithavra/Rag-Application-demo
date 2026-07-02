/**
 * Node Modules
 */
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Other Imports
 */
import { llm } from "../config";


export async function generateAnswer(question: string, chunks: any[]) {
  const context = chunks
    .map((chunk, index) => `[Source ${index + 1}: ${chunk.filename}]\n${chunk.text}`)
    .join("\n\n");

  const response = await llm.invoke([
    new SystemMessage(
      "Answer only from the provided context. If the answer is not present, say you do not know based on the uploaded documents."
    ),
    new HumanMessage(`Context:\n${context}\n\nQuestion:\n${question}`)
  ]);

  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}