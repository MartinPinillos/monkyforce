import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { normalizeLoginName, verifyPassword } from '../users/user-password';
import { User } from '../users/user.entity';
import { AuthSession } from './auth-session.entity';
import { AuthTokenService, type AuthTokenPair } from './auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    private readonly tokens: AuthTokenService,
  ) {}

  async login(login: unknown, password: unknown): Promise<AuthTokenPair> {
    if (typeof login !== 'string' || typeof password !== 'string') {
      throw new UnauthorizedException();
    }

    const loginName = normalizeLoginName(login);
    if (
      !loginName ||
      loginName.length > 100 ||
      !password ||
      password.length > 1024
    ) {
      throw new UnauthorizedException();
    }

    const user = await this.users.findOneBy({ loginName });
    const validPassword = await verifyPassword(password, user?.passwordHash);
    if (!user || user.active !== 1 || !validPassword) {
      throw new UnauthorizedException();
    }

    const id = randomUUID();
    const pair = await this.tokens.issuePair(user.id, id);
    await this.sessions.insert({
      id,
      userId: user.id,
      refreshTokenHash: createHash('sha256')
        .update(pair.refreshToken)
        .digest('hex'),
      expiresAt: pair.refreshExpiresAt,
      revokedAt: null,
    });

    return pair;
  }
}
