import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalError } from "../utils/errors/custom.error.ts";

export default function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Access token is required"));
  }

  const token = header.slice(7).trim();
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    return next(new InternalError("JWT access secret is not configured securely"));
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER ?? "task-management-api",
      audience: process.env.JWT_AUDIENCE ?? "task-management-client",
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      payload.sub.length === 0 ||
      typeof payload.email !== "string"
    ) {
      return next(new UnauthorizedError("Invalid access token payload"));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return next(new UnauthorizedError("Invalid or expired access token"));
    }

    return next(error);
  }
}