import { Injectable, type CookieSerializeOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../auth.constants.js';
import type { AuthTokenPair } from '../auth.types.js';

@Injectable()
export class AuthCookieService {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
  ) {}

  set(response: unknown, tokens: AuthTokenPair): void {
    const now = Date.now();

    this.adapterHost.httpAdapter.setCookie(
      response,
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      {
        ...this.baseOptions(),
        maxAge: Math.max(
          0,
          Math.floor((tokens.accessExpiresAt.getTime() - now) / 1000),
        ),
      },
    );
    this.adapterHost.httpAdapter.setCookie(
      response,
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      {
        ...this.baseOptions(),
        maxAge: Math.max(
          0,
          Math.floor((tokens.refreshExpiresAt.getTime() - now) / 1000),
        ),
      },
    );
  }

  clear(response: unknown): void {
    const options = this.baseOptions();
    this.adapterHost.httpAdapter.clearCookie(
      response,
      ACCESS_TOKEN_COOKIE,
      options,
    );
    this.adapterHost.httpAdapter.clearCookie(
      response,
      REFRESH_TOKEN_COOKIE,
      options,
    );
  }

  private baseOptions(): CookieSerializeOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }
}
