import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter.
 *
 * - Returns a consistent JSON error shape for every request.
 * - In production, internal error messages/stack traces are never exposed to
 *   the client (they are logged server-side only).
 * - 5xx errors and unknown exceptions are always logged with their stack.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const isProduction = process.env.NODE_ENV === 'production';

    let message: string | string[] = 'Internal server error';
    if (isHttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const bodyMessage = (body as any).message;
        message = Array.isArray(bodyMessage) ? bodyMessage : bodyMessage ?? exception.message;
      }
    } else if (!isProduction) {
      // Development only: surface the real error so it is easy to debug.
      message = exception instanceof Error ? exception.message : String(exception);
    }

    // Always log the full error server-side; never leak internals to the client.
    if (!isHttpException || status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
