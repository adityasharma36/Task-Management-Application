import prisma from "../prisma/client.ts";

class TokenRepository {
  async createToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findByTokenHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async rotateToken(
    oldTokenHash: string,
    newTokenHash: string,
    expiresAt: Date
  ) {
    return prisma.$transaction(async (tx) => {
      const oldToken = await tx.refreshToken.findUnique({
        where: { tokenHash: oldTokenHash },
      });

      if (
        !oldToken ||
        oldToken.revokedAt ||
        oldToken.expiresAt.getTime() <= Date.now()
      ) {
        return null;
      }

      const now = new Date();

      const result = await tx.refreshToken.updateMany({
        where: {
          id: oldToken.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      // Another request may already have rotated this token.
      if (result.count !== 1) return null;

      await tx.refreshToken.create({
        data: {
          userId: oldToken.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });

      return { userId: oldToken.userId };
    });
  }

  async revokeToken(tokenHash: string) {
    const now = new Date();

    return prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }
}

export default TokenRepository;