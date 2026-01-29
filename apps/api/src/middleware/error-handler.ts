/**
 * Global error handling middleware.
 */

import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { createApiError } from '../lib/utils';
import { HTTP_STATUS } from '@orrisai/agent-otp-shared';

/**
 * Error codes for API errors.
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Global error handler for the API.
 */
export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // Handle HTTP exceptions (thrown by middleware/handlers)
  if (err instanceof HTTPException) {
    const status = err.status;
    let code: string = ERROR_CODES.INTERNAL_ERROR;

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        code = ERROR_CODES.VALIDATION_ERROR;
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        code = ERROR_CODES.UNAUTHORIZED;
        break;
      case HTTP_STATUS.FORBIDDEN:
        code = ERROR_CODES.FORBIDDEN;
        break;
      case HTTP_STATUS.NOT_FOUND:
        code = ERROR_CODES.NOT_FOUND;
        break;
      case HTTP_STATUS.CONFLICT:
        code = ERROR_CODES.CONFLICT;
        break;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        code = ERROR_CODES.RATE_LIMITED;
        break;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        code = ERROR_CODES.SERVICE_UNAVAILABLE;
        break;
    }

    return c.json(createApiError(code, err.message), status);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.reduce(
      (acc, error) => {
        const path = error.path.join('.');
        acc[path] = error.message;
        return acc;
      },
      {} as Record<string, string>
    );

    return c.json(
      createApiError(
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        details
      ),
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle unknown errors
  return c.json(
    createApiError(
      ERROR_CODES.INTERNAL_ERROR,
      'An unexpected error occurred'
    ),
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Not found handler for unmatched routes.
 */
export function notFoundHandler(c: Context) {
  return c.json(
    createApiError(ERROR_CODES.NOT_FOUND, 'Resource not found'),
    HTTP_STATUS.NOT_FOUND
  );
}
