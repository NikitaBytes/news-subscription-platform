// Logging service for actions and errors (NIST: audit trail)

import { prisma } from '../db/prisma';
import type { JwtPayload } from '../types';

interface LogActionParams {
  user?: JwtPayload;
  actionType: string;
  actionDetails?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logUserAction(params: LogActionParams) {
  try {
    await prisma.userActionLog.create({
      data: {
        userId: params.user?.userId || null,
        actionType: params.actionType,
        actionDetails: params.actionDetails,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Error logging user action:', error);
  }
}

export async function logAppError(errorType: string, message: string, url?: string) {
  try {
    await prisma.appErrorLog.create({
      data: { errorType, message, url },
    });
  } catch (error) {
    console.error('Error logging app error:', error);
  }
}

export async function logHttpError(
  statusCode: number,
  method: string,
  url: string,
  ipAddress?: string,
  message?: string
) {
  try {
    await prisma.httpErrorLog.create({
      data: { statusCode, method, url, ipAddress, message },
    });
  } catch (error) {
    console.error('Error logging HTTP error:', error);
  }
}
