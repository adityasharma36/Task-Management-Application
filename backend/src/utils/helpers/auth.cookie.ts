import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE_NAME = "refreshToken";

const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/v1/auth",
  maxAge:
    Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "7") *
    24 * 60 * 60 * 1000,
};

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/v1/auth",
  });
}