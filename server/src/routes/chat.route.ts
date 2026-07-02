/**
 * Node Imports
 */

import { Router } from "express";

/**
 * Other Imports
 */
import { requiredAuth } from "../middleware";
import { askQuestion, createChat, getChatMessages } from "../controllers";

export const ChatRouter = Router()

ChatRouter.post("/", requiredAuth, createChat);
ChatRouter.post("/:chatId/messages", requiredAuth, askQuestion);
ChatRouter.get("/:chatId/messages", requiredAuth, getChatMessages);
