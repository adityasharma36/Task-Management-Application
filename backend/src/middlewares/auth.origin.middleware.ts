import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors/custom.error.ts";

export default function authOriginMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const expectedOrigin = process.env.FRONTEND_ORIGIN;
  const origin = req.get("origin");

  if (!expectedOrigin || !origin || origin !== expectedOrigin) {
    return next(new UnauthorizedError("Request origin is not allowed"));
  }

  next();
}