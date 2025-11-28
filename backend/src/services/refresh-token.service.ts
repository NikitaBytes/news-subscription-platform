// Service for managing Refresh Tokens
// OWASP: Secure Token Storage, Token Rotation

import { prisma } from '../db/prisma';
import { hashFingerprint, verifyFingerprint } from '../utils/fingerprint';
import { generateRefreshToken, verifyRefreshToken, decodeToken } from '../utils/jwt';
import type { JwtPayload } from '../types';

interface CreateRefreshTokenParams {
  userId: number;
  jwtPayload: JwtPayload;
  ipAddress?: string;
  userAgent?: string;
  existingFingerprint: string; // REQUIRED - fingerprint from client
}

interface RefreshTokenResult {
  token: string;
  fingerprint: string;
  expiresAt: Date;
}

/**
 * Creates a new Refresh Token with fingerprint
 */
export async function createRefreshToken(
  params: CreateRefreshTokenParams
): Promise<RefreshTokenResult> {
  const { userId, jwtPayload, ipAddress, userAgent, existingFingerprint } = params;

  if (!existingFingerprint) {
    throw new Error('Fingerprint is required');
  }

  // Generate tokens
  const refreshToken = generateRefreshToken(jwtPayload);
  // Use fingerprint from client
  const fingerprint = existingFingerprint;
  const fingerprintHash = hashFingerprint(fingerprint);

  // Get expiresAt from token
  const decoded = decodeToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  // Save to DB
  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      fingerprintHash,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return {
    token: refreshToken,
    fingerprint,
    expiresAt,
  };
}

/**
 * Verifies and updates Refresh Token (Token Rotation)
 */
export async function rotateRefreshToken(
  oldToken: string,
  fingerprint: string,
  ipAddress?: string,
  userAgent?: string
): Promise<RefreshTokenResult> {
  // Проверяем JWT signature
  const payload = verifyRefreshToken(oldToken);

  // Удаляем системные поля из payload перед созданием нового токена
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, ...cleanPayload } = payload as any;

  // Ищем токен в БД
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  // Проверяем fingerprint
  if (!verifyFingerprint(fingerprint, storedToken.fingerprintHash)) {
    // Возможная кража токена - удаляем все токены пользователя
    await revokeAllUserTokens(storedToken.userId);
    throw new Error('Fingerprint mismatch - security breach detected');
  }

  // Проверяем срок действия
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new Error('Refresh token expired');
  }

  // Удаляем старый токен
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Создаем новый токен (Token Rotation)
  // Переиспользуем fingerprint клиента чтобы избежать race condition при concurrent refresh
  return createRefreshToken({
    userId: storedToken.userId,
    jwtPayload: cleanPayload,
    ipAddress,
    userAgent,
    existingFingerprint: fingerprint, // Переиспользуем проверенный fingerprint
  });
}

/**
 * Removes a specific Refresh Token (logout)
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
}

/**
 * Removes all user's Refresh Tokens (logout from all devices)
 */
export async function revokeAllUserTokens(userId: number): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

/**
 * Cleans expired tokens (for cron job)
 */
export async function cleanExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

/**
 * Gets information about user's tokens
 */
export async function getUserRefreshTokens(userId: number) {
  return prisma.refreshToken.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
