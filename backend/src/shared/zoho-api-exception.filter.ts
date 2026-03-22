import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';
import { ZohoApiError } from '../base/ZohoBaseClient';

/**
 * Global exception filter that converts Axios / Zoho API errors into
 * meaningful HTTP responses instead of generic 500 Internal Server Error.
 *
 * Priority:
 *  1. NestJS HttpException → forwarded as-is
 *  2. ZohoApiError         → returns the Zoho-level error code + message
 *  3. AxiosError           → returns the upstream HTTP status + response body
 *  4. Everything else      → 500 with the error message
 */
@Catch()
export class ZohoApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ZohoApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // 1. NestJS HttpException (BadRequest, NotFound, Unauthorized …)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      res.status(status).json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
      return;
    }

    // 2. ZohoApiError (business-level error returned with HTTP 200 by Zoho)
    if (exception instanceof ZohoApiError) {
      const status = exception.response?.status ?? 400;
      this.logger.warn(
        `ZohoApiError: ${exception.message} (code=${exception.code})`,
      );
      res.status(status).json({
        statusCode: status,
        zohoErrorCode: exception.code,
        message: exception.message,
        error: 'Zoho API Error',
      });
      return;
    }

    // 3. AxiosError (HTTP-level failure from Zoho or other upstream)
    if (exception instanceof AxiosError) {
      const upstream = exception.response;
      const status = upstream?.status ?? 502;
      const data = upstream?.data as Record<string, unknown> | string | undefined;

      // Extract the most useful message from the upstream body
      let message: string;
      if (typeof data === 'object' && data !== null) {
        message =
          (data['message'] as string) ??
          (data['error'] as string) ??
          (data['description'] as string) ??
          JSON.stringify(data);
      } else if (typeof data === 'string') {
        message = data;
      } else {
        message = exception.message;
      }

      this.logger.warn(
        `AxiosError ${status}: ${message} — ${exception.config?.method?.toUpperCase()} ${exception.config?.url}`,
      );

      res.status(status).json({
        statusCode: status,
        message,
        error: 'Upstream API Error',
        ...(typeof data === 'object' && data !== null ? { details: data } : {}),
      });
      return;
    }

    // 4. Unknown error — 500
    const msg =
      exception instanceof Error ? exception.message : 'Internal server error';
    this.logger.error(`Unhandled exception: ${msg}`, (exception as Error)?.stack);
    res.status(500).json({
      statusCode: 500,
      message: msg,
      error: 'Internal Server Error',
    });
  }
}
