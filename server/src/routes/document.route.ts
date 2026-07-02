/**
 * Node Imports
 */
import { Router } from "express";
import { requiredAuth } from "../middleware";
import { upload } from "../config/multer";
import { getDocuments, uploadDocument } from "../controllers";

export const documentRouter = Router();

documentRouter.post("/",requiredAuth,upload.single("file"),uploadDocument)
documentRouter.get("/",requiredAuth,getDocuments)