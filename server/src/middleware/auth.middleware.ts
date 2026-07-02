import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth";
import { ApiError } from "../utils";
export interface AuthRequest extends Request {
  userId?: string;
}

export const requiredAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return next(new ApiError(401, "Unauthorized"));
  }
  req.userId = session.user.id;
  next();
};
