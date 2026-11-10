import { Injectable } from '@nestjs/common';
import { parseCookie } from 'cookie';
import type { CookieOptions, Request, Response } from 'express';
import type { AuthTokenPair } from './auth-token.service';
import { AuthConfig } from './auth.config';

const ACCESS_COOKIE = 'mf_access';
const REFRESH_COOKIE = 'mf_refresh';

@Injectable()
export class AuthCookieService {
  private readonly options: CookieOptions;

  constructor(config: AuthConfig) {
    this.options = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.secureCookies,
      path: '/',
    };
  }

  readAccessToken(request: Request): string | undefined {
    return (
      parseCookie(request.headers.cookie ?? '')[ACCESS_COOKIE] || undefined
    );
  }

  readRefreshToken(request: Request): string | undefined {
    return (
      parseCookie(request.headers.cookie ?? '')[REFRESH_COOKIE] || undefined
    );
  }

  set(response: Response, tokens: AuthTokenPair): void {
    response.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...this.options,
      expires: tokens.accessExpiresAt,
    });
    response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...this.options,
      expires: tokens.refreshExpiresAt,
    });
  }

  clear(response: Response): void {
    response.clearCookie(ACCESS_COOKIE, this.options);
    response.clearCookie(REFRESH_COOKIE, this.options);
  }
}
