import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import {
  DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  DEFAULT_JWT_AUDIENCE,
  DEFAULT_JWT_ISSUER,
  DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
} from '../auth.constants.js';
import type { AuthTokenPair, AuthTokenPayload } from '../auth.types.js';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issuePair(userId: number, sessionId: string): Promise<AuthTokenPair> {
    const accessTtl = this.getPositiveInteger(
      'JWT_ACCESS_TTL_SECONDS',
      DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
    );
    const refreshTtl = this.getPositiveInteger(
      'JWT_REFRESH_TTL_SECONDS',
      DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
    );
    const now = Date.now();
    const sharedOptions = {
      issuer: this.config.get<string>('JWT_ISSUER') ?? DEFAULT_JWT_ISSUER,
      audience: this.config.get<string>('JWT_AUDIENCE') ?? DEFAULT_JWT_AUDIENCE,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: String(userId), sid: sessionId, typ: 'access' },
        {
          ...sharedOptions,
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: accessTtl,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: String(userId),
          sid: sessionId,
          typ: 'refresh',
          jti: randomUUID(),
        },
        {
          ...sharedOptions,
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshTtl,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt: new Date(now + accessTtl * 1000),
      refreshExpiresAt: new Date(now + refreshTtl * 1000),
    };
  }

  verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    return this.verify(token, 'access', 'JWT_ACCESS_SECRET');
  }

  verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    return this.verify(token, 'refresh', 'JWT_REFRESH_SECRET');
  }

  async tryExtractSessionId(
    token: string | undefined,
    type: 'access' | 'refresh',
  ): Promise<string | null> {
    if (!token) {
      return null;
    }

    try {
      const secretKey =
        type === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET';
      const payload = await this.jwtService.verifyAsync<AuthTokenPayload>(
        token,
        {
          secret: this.config.getOrThrow<string>(secretKey),
          issuer: this.config.get<string>('JWT_ISSUER') ?? DEFAULT_JWT_ISSUER,
          audience:
            this.config.get<string>('JWT_AUDIENCE') ?? DEFAULT_JWT_AUDIENCE,
          ignoreExpiration: true,
        },
      );

      return this.isPayload(payload, type) ? payload.sid : null;
    } catch {
      return null;
    }
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  private async verify(
    token: string,
    type: 'access' | 'refresh',
    secretKey: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET',
  ): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthTokenPayload>(
        token,
        {
          secret: this.config.getOrThrow<string>(secretKey),
          issuer: this.config.get<string>('JWT_ISSUER') ?? DEFAULT_JWT_ISSUER,
          audience:
            this.config.get<string>('JWT_AUDIENCE') ?? DEFAULT_JWT_AUDIENCE,
        },
      );

      if (!this.isPayload(payload, type)) {
        throw new UnauthorizedException('Authentication required');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }

  private isPayload(
    payload: AuthTokenPayload,
    type: 'access' | 'refresh',
  ): boolean {
    const userId = Number(payload.sub);

    return (
      payload.typ === type &&
      Number.isSafeInteger(userId) &&
      userId > 0 &&
      typeof payload.sid === 'string' &&
      payload.sid.length > 0 &&
      (type !== 'refresh' ||
        (typeof payload.jti === 'string' && payload.jti.length > 0))
    );
  }

  private getPositiveInteger(key: string, fallback: number): number {
    const value = Number(this.config.get<string | number>(key) ?? fallback);

    return Number.isSafeInteger(value) && value > 0 ? value : fallback;
  }
}
