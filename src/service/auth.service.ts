import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/user.repositorie.ts";
import TokenService from "./token.service.ts";
import {
  ConflictError,
  UnauthorizedError,
  InternalError,
} from "../utils/errors/custom.error.ts";
import type { RegisterDTO, LoginDTO } from "../dtos/auth.dto.ts";

class AuthService {
  private readonly users = new UserRepository();
  private readonly tokens = new TokenService();

  private accessToken(user: { id: string; email: string }) {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret || secret.length < 32) {
      throw new InternalError("JWT access secret is missing or too short");
    }

    return jwt.sign(
      { email: user.email },
      secret,
      {
        algorithm: "HS256",
        subject: user.id,
        issuer: process.env.JWT_ISSUER ?? "task-management-api",
        audience: process.env.JWT_AUDIENCE ?? "task-management-client",
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? "10m") ,
      }as jwt.SignOptions
    );
  }

  async register(data: RegisterDTO) {
    const existing = await this.users.findByEmail(data.email);

    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    try {
      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await this.users.createUser({
        name: data.name,
        email: data.email,
        passwordHash,
      });

      const refresh = await this.tokens.createRefreshToken(user.id);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken: this.accessToken(user),
        refreshToken: refresh.refreshToken,
        refreshTokenExpiresAt: refresh.expiresAt,
      };
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) throw error;

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Email is already registered");
      }

      throw new InternalError("Registration failed");
    }
  }

  async login(data: LoginDTO) {
    const user = await this.users.findByEmail(data.email);

    // Use the same message for an unknown email and an incorrect password.
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const refresh = await this.tokens.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: this.accessToken(user),
      refreshToken: refresh.refreshToken,
      refreshTokenExpiresAt: refresh.expiresAt,
    };
  }

  async refresh(rawToken: string) {
    const rotated = await this.tokens.rotateRefreshToken(rawToken);
    const user = await this.users.findById(rotated.userId);

    if (!user) {
      await this.tokens.revokeRefreshToken(rotated.refreshToken);
      throw new UnauthorizedError("User account is unavailable");
    }

    return {
      accessToken: this.accessToken(user),
      refreshToken: rotated.refreshToken,
      refreshTokenExpiresAt: rotated.expiresAt,
    };
  }

  async logout(rawToken: string) {
    await this.tokens.revokeRefreshToken(rawToken);
    return { message: "Logged out successfully" };
  }

  async logoutAll(userId: string) {
    await this.tokens.revokeAllUserTokens(userId);
    return { message: "All refresh sessions revoked" };
  }
}

export default AuthService;