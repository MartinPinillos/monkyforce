import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AUTH_SESSIONS_REPOSITORY,
  type AuthSessionsRepository,
} from './auth-sessions.repository.js';
import type { AuthTokenPair, AuthTokenPayload } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import { PasswordHasherService } from './security/password-hasher.service.js';
import { AuthTokenService } from './security/auth-token.service.js';
import type { AuthenticatedUser } from '../users/domain/authenticated-user.js';
import { mapToAuthenticatedUser } from '../users/users.mapper.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../users/users.repository.js';

export interface AuthResult {
  user: AuthenticatedUser;
  tokens: AuthTokenPair;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly sessionsRepository: AuthSessionsRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async login(credentials: LoginDto): Promise<AuthResult> {
    const loginName = this.normalizeLoginName(credentials.loginName);
    const user =
      await this.usersRepository.findByLoginNameWithAuthorization(loginName);

    if (!user) {
      await this.passwordHasher.burn(credentials.password);
      throw this.invalidCredentials();
    }

    const passwordMatches = await this.passwordHasher.verify(
      credentials.password,
      user.passwordHash,
    );

    if (!passwordMatches || !user.isActive) {
      throw this.invalidCredentials();
    }

    const sessionId = randomUUID();
    const tokens = await this.tokenService.issuePair(user.id, sessionId);

    await this.sessionsRepository.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: this.tokenService.hashRefreshToken(tokens.refreshToken),
      expiresAt: tokens.refreshExpiresAt,
    });

    return {
      user: mapToAuthenticatedUser(user),
      tokens,
    };
  }

  async refresh(refreshToken: string | undefined): Promise<AuthResult> {
    if (!refreshToken) {
      throw this.authenticationRequired();
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const userId = Number(payload.sub);
    const now = new Date();
    const session = await this.sessionsRepository.findActiveById(
      payload.sid,
      now,
    );

    if (!session || session.userId !== userId) {
      throw this.authenticationRequired();
    }

    const user = await this.usersRepository.findByIdWithAuthorization(userId);

    if (!user?.isActive) {
      throw this.authenticationRequired();
    }

    const tokens = await this.tokenService.issuePair(user.id, session.id);
    const rotated = await this.sessionsRepository.rotate(
      session.id,
      this.tokenService.hashRefreshToken(refreshToken),
      this.tokenService.hashRefreshToken(tokens.refreshToken),
      tokens.refreshExpiresAt,
      now,
    );

    if (!rotated) {
      throw this.authenticationRequired();
    }

    return {
      user: mapToAuthenticatedUser(user),
      tokens,
    };
  }

  async resolveAuthenticatedUser(
    payload: AuthTokenPayload,
  ): Promise<AuthenticatedUser> {
    const userId = Number(payload.sub);
    const [session, user] = await Promise.all([
      this.sessionsRepository.findActiveById(payload.sid, new Date()),
      this.usersRepository.findByIdWithAuthorization(userId),
    ]);

    if (!session || session.userId !== userId || !user?.isActive) {
      throw this.authenticationRequired();
    }

    return mapToAuthenticatedUser(user);
  }

  async logout(
    accessToken: string | undefined,
    refreshToken: string | undefined,
  ): Promise<void> {
    const sessionId =
      (await this.tokenService.tryExtractSessionId(accessToken, 'access')) ??
      (await this.tokenService.tryExtractSessionId(refreshToken, 'refresh'));

    if (sessionId) {
      await this.sessionsRepository.revoke(sessionId, new Date());
    }
  }

  private normalizeLoginName(loginName: string): string {
    return loginName.trim().toLocaleLowerCase('en-US');
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException('Invalid credentials');
  }

  private authenticationRequired(): UnauthorizedException {
    return new UnauthorizedException('Authentication required');
  }
}
