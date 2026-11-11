import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { AuthConfig } from './auth.config';

type TokenType = 'access' | 'refresh';

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

export interface AuthTokenPayload {
  sub: string;
  sid: string;
  typ: TokenType;
  iat: number;
  exp: number;
  jti?: string;
}

const JWT_ALGORITHM = 'HS256';
const JWT_SCOPE = { issuer: 'monkyforce-api', audience: 'monkyforce-web' };

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AuthConfig,
  ) {}

  async issuePair(userId: number, sessionId: string): Promise<AuthTokenPair> {
    const iat = Math.floor(Date.now() / 1000);
    const claims = { sub: String(userId), sid: sessionId, iat };
    const { secret, accessTtlSeconds, refreshTtlSeconds } = this.config;
    const signOptions = {
      ...JWT_SCOPE,
      algorithm: JWT_ALGORITHM,
      secret,
    } as const;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...claims, typ: 'access' },
        {
          ...signOptions,
          expiresIn: accessTtlSeconds,
        },
      ),
      this.jwt.signAsync(
        { ...claims, typ: 'refresh', jti: randomUUID() },
        {
          ...signOptions,
          expiresIn: refreshTtlSeconds,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt: new Date((iat + accessTtlSeconds) * 1000),
      refreshExpiresAt: new Date((iat + refreshTtlSeconds) * 1000),
    };
  }

  verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    return this.verify(token, 'access');
  }

  verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    return this.verify(token, 'refresh');
  }

  private async verify(
    token: string,
    type: TokenType,
  ): Promise<AuthTokenPayload> {
    let payload: Partial<AuthTokenPayload>;
    try {
      payload = await this.jwt.verifyAsync<Partial<AuthTokenPayload>>(token, {
        ...JWT_SCOPE,
        algorithms: [JWT_ALGORITHM],
        secret: this.config.secret,
      });
    } catch {
      throw new UnauthorizedException();
    }

    if (!isTokenPayload(payload, type)) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}

function isTokenPayload(
  payload: Partial<AuthTokenPayload>,
  type: TokenType,
): payload is AuthTokenPayload {
  return (
    payload?.typ === type &&
    typeof payload.sub === 'string' &&
    /^[1-9]\d*$/.test(payload.sub) &&
    Number.isSafeInteger(Number(payload.sub)) &&
    typeof payload.sid === 'string' &&
    payload.sid.trim().length > 0 &&
    Number.isSafeInteger(payload.iat) &&
    Number.isSafeInteger(payload.exp) &&
    (type === 'access' ||
      (typeof payload.jti === 'string' && payload.jti.length > 0))
  );
}
