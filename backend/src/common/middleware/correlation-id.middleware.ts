import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function correlationIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const correlationId =
    request.header('x-correlation-id')?.trim() || randomUUID();

  request.headers['x-correlation-id'] = correlationId;
  response.setHeader('x-correlation-id', correlationId);
  next();
}
