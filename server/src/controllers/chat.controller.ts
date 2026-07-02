import type { AuthRequest } from "../middleware/auth.middleware";
import { embeddings } from "../config";
import { ChatMessageModel, ChatModel } from "../models";
import { ApiError, ApiResponse, asyncHandler } from "../utils";
import { generateAnswer, retrieveRelevantChunks } from "../services";

export const createChat = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const chat = await ChatModel.create({
    userId: req.user?.id,
    title: req.body.title || "New Chat",
  });

  res.status(201).json(new ApiResponse(true, chat, "Chat created"));
});

export const askQuestion = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const chatId = Array.isArray(req.params.chatId) ? req.params.chatId[0] : req.params.chatId;
  const { question } = req.body;

  if (!chatId) {
    throw new ApiError(400, "Chat ID is required");
  }

  if (!question) {
    throw new ApiError(400, "Question is required");
  }

  const queryVector = await embeddings.embedQuery(question);
  const chunks = await retrieveRelevantChunks(req.user.id, queryVector);

  const answer = await generateAnswer(question, chunks);

  await ChatMessageModel.create({
    userId: req.user.id,
    chatId,
    role: "user",
    content: question,
  });

  const assistantMessage = await ChatMessageModel.create({
    userId: req.user.id,
    chatId,
    role: "assistant",
    content: answer,
    sources: chunks.map((chunk) => ({
      documentId: chunk.documentId,
      filename: chunk.filename,
      text: chunk.text,
      score: chunk.score,
    })),
  });

  res.json(new ApiResponse(true, assistantMessage, "Answer generated"));
});

export const getChatMessages = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");

  const chatId = Array.isArray(req.params.chatId) ? req.params.chatId[0] : req.params.chatId;

  if (!chatId) {
    throw new ApiError(400, "Chat ID is required");
  }

  const messages = await ChatMessageModel.find({
    userId: req.user?.id,
    chatId,
  }).sort({ createdAt: 1 });

  res.json(new ApiResponse(true, messages, "Messages fetched"));
});
