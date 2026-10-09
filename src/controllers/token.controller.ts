
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import TokenService from "../service/token.service.ts";

class TokenController {
  private readonly tokenService = new TokenService();


  validateRefreshToken = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const token = await this.tokenService.rotateRefreshToken(
        refreshToken,
      );

      res.status(200).json({
        success: true,
        message: "Refresh token is valid",
        data: {
          userId: token.userId,
          expiresAt: token.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  revokeRefreshToken = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const result = await this.tokenService.revokeRefreshToken(
        refreshToken,
      );

      res.status(200).json({
        success: true,
        ...(result ?? {}),
      });
    } catch (error) {
      next(error);
    }
  };


  revokeAllUserTokens = async (req: Request, res: Response,next: NextFunction): Promise<void> => {
    try {

      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const result = await this.tokenService.revokeAllUserTokens(
        userId,
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };


  cleanupExpiredTokens = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.tokenService.cleanupExpiredTokens();

      res.status(200).json({
        success: true,
        message: "Expired tokens cleaned up",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TokenController;