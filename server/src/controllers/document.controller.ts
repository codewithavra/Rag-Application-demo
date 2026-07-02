import { DocumentModel } from "../models/document.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { ingestionQueue } from "../queues/ingest.queue";
import type { AuthRequest } from "../middleware/auth.middleware";

export const uploadDocument = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const document = await DocumentModel.create({
    userId: req.user.id,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    status: "queued",
  });

  await ingestionQueue.add("ingest-document", {
    userId: req.user.id,
    documentId: document._id.toString(),
    filePath: req.file.path,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
  });

  res
    .status(201)
    .json(new ApiResponse(true, document, "Document queued for processing"));
});

export const getDocuments = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }

  const documents = await DocumentModel.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json(new ApiResponse(true, documents, "Documents fetched"));
});
