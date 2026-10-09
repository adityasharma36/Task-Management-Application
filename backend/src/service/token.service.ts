import { createHash, randomBytes } from "node:crypto";
import TokenRepository from "../repositories/token.repositorie.ts";
import {
  UnauthorizedError,
  InternalError,
} from "../utils/errors/custom.error.ts";

class TokenService {
  private readonly repository = new TokenRepository();

  private hash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private expiry() {
    const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "7");

    if (!Number.isInteger(days) || days < 1 || days > 30) {
      throw new InternalError("Invalid refresh-token expiry configuration");
    }

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async createRefreshToken(userId: string) {
    const refreshToken = randomBytes(32).toString("base64url");
    const expiresAt = this.expiry();

    await this.repository.createToken({
      userId,
      tokenHash: this.hash(refreshToken),
      expiresAt,
    });

    return { refreshToken, expiresAt };
  }

  async rotateRefreshToken(rawToken: string) {
    if (!rawToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    const replacement = randomBytes(32).toString("base64url");
    const expiresAt = this.expiry();

    const result = await this.repository.rotateToken(
      this.hash(rawToken),
      this.hash(replacement),
      expiresAt
    );

    if (!result) {
      throw new UnauthorizedError("Invalid, expired, or reused refresh token");
    }

    return {
      userId: result.userId,
      refreshToken: replacement,
      expiresAt,
    };
  }

  async revokeRefreshToken(rawToken: string) {
    if (!rawToken) return;

    // Idempotent logout: no need to disclose whether a token existed.
    await this.repository.revokeToken(this.hash(rawToken));
  }

  async revokeAllUserTokens(userId: string) {
    return this.repository.revokeAllUserTokens(userId);
  }

  async cleanupExpiredTokens() {
    const result = await this.repository.deleteExpiredTokens();
    return result.count;
  }
}

export default TokenService;