import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function configureHttpSecurity(app: NestExpressApplication): void {
  const webAppOrigin = readWebAppOrigin();

  app.enableCors({
    origin: (origin, callback) => callback(null, origin === webAppOrigin),
    credentials: true,
  });

  app.use((request: Request, response: Response, next: NextFunction) => {
    response.vary('Origin');

    if (
      SAFE_METHODS.has(request.method) ||
      request.headers.origin === webAppOrigin
    ) {
      next();
      return;
    }

    response.status(403).json({
      statusCode: 403,
      message: 'Untrusted request origin',
    });
  });
}

function readWebAppOrigin(): string {
  const origin = process.env.WEB_APP?.trim();
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('WEB_APP is required in production');
    }

    return 'http://localhost:4200';
  }

  const url = URL.parse(origin);
  if (
    !url ||
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.origin !== origin
  ) {
    throw new Error('WEB_APP must be an HTTP(S) origin without a path');
  }

  return origin;
}
