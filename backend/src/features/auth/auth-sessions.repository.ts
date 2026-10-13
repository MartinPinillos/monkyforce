import type { AuthSessionEntity } from './entities/auth-session.entity.js';

export const AUTH_SESSIONS_REPOSITORY = Symbol('AUTH_SESSIONS_REPOSITORY');

export interface CreateAuthSession {
  id: string;
  userId: number;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface AuthSessionsRepository {
  create(session: CreateAuthSession): Promise<AuthSessionEntity>;
  findActiveById(
    sessionId: string,
    now: Date,
  ): Promise<AuthSessionEntity | null>;
  rotate(
    sessionId: string,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    nextExpiresAt: Date,
    now: Date,
  ): Promise<boolean>;
  revoke(sessionId: string, now: Date): Promise<void>;
}
