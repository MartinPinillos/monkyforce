import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import type {
  AuthSessionsRepository,
  CreateAuthSession,
} from '../auth-sessions.repository.js';
import { AuthSessionEntity } from '../entities/auth-session.entity.js';

@Injectable()
export class AuthSessionsTypeormRepository implements AuthSessionsRepository {
  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly repository: Repository<AuthSessionEntity>,
  ) {}

  async create(session: CreateAuthSession): Promise<AuthSessionEntity> {
    return this.repository.save(
      this.repository.create({
        ...session,
        revokedAt: null,
      }),
    );
  }

  findActiveById(
    sessionId: string,
    now: Date,
  ): Promise<AuthSessionEntity | null> {
    return this.repository.findOne({
      where: {
        id: sessionId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
    });
  }

  async rotate(
    sessionId: string,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    nextExpiresAt: Date,
    now: Date,
  ): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(AuthSessionEntity)
      .set({
        refreshTokenHash: nextRefreshTokenHash,
        expiresAt: nextExpiresAt,
      })
      .where('ID = :sessionId', { sessionId })
      .andWhere('REFRESH_TOKEN_HASH = :currentRefreshTokenHash', {
        currentRefreshTokenHash,
      })
      .andWhere('REVOKED_AT IS NULL')
      .andWhere('EXPIRES_AT > :now', { now })
      .execute();

    return result.affected === 1;
  }

  async revoke(sessionId: string, now: Date): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(AuthSessionEntity)
      .set({ revokedAt: now })
      .where('ID = :sessionId', { sessionId })
      .andWhere('REVOKED_AT IS NULL')
      .execute();
  }
}
