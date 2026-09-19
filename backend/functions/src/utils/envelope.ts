import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse, ErrorCode, ApiErrorDetail } from '../types/contract';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: { nextCursor?: string | null; count?: number; unreadCount?: number; [key: string]: any }
): Response {
  const response: ApiSuccessResponse<T> = {
    ok: true,
    data,
    meta: {
      serverTime: new Date().toISOString(),
      ...meta,
    },
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode = 400,
  details?: ApiErrorDetail[] | Record<string, any>
): Response {
  const response: ApiErrorResponse = {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(response);
}

export function mapHttpCodeToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 413:
      return 'PAYLOAD_TOO_LARGE';
    case 429:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL';
  }
}
