/**
 * Node Imports
 */

import type { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
