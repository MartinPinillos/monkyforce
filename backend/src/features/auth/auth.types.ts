import type { Request } from 'express';
import type { AuthenticatedUser } from '../users/domain/authenticated-user.js';

export interface AuthTokenPayload {
  sub: string;
  sid: string;
  typ: 'access' | 'refresh';
  jti?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
}
