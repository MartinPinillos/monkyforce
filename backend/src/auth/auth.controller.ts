import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('login')
  @HttpCode(204)
  async login(
    @Body('loginName') loginName: unknown,
    @Body('password') password: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const tokens = await this.auth.login(loginName, password);
    this.cookies.set(response, tokens);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.logout(
      this.cookies.readAccessToken(request),
      this.cookies.readRefreshToken(request),
    );
    this.cookies.clear(response);
  }
}
