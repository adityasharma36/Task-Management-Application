import type { Request, Response, NextFunction } from "express";
import AuthService from "../service/auth.service.ts";
import {
  registerSchema,
  loginSchema,
} from "../dtos/auth.dto.ts";
import {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/helpers/auth.cookie.ts";
import { UnauthorizedError } from "../utils/errors/custom.error.ts";

class AuthController {
  private readonly auth = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.auth.register(registerSchema.parse(req.body));

      setRefreshCookie(res, result.refreshToken);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.auth.login(loginSchema.parse(req.body));

      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE_NAME];

      if (typeof token !== "string" || !token) {
        throw new UnauthorizedError("Refresh session is missing");
      }

      const result = await this.auth.refresh(token);
      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: { accessToken: result.accessToken },
      });
    } catch (error) {
      // Clear stale/invalid cookies too.
      clearRefreshCookie(res);
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE_NAME];

      if (typeof token === "string" && token) {
        await this.auth.logout(token);
      }

      clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("Authentication required");
      }

      await this.auth.logoutAll(userId);
      clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        message: "All refresh sessions revoked",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;