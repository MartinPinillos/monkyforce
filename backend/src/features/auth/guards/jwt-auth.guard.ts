import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN_COOKIE, IS_PUBLIC_KEY } from '../auth.constants.js';
import { AuthService } from '../auth.service.js';
import type { AuthenticatedRequest } from '../auth.types.js';
import { AuthTokenService } from '../security/auth-token.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: AuthTokenService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.readCookie(request, ACCESS_TOKEN_COOKIE);

    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

    const payload = await this.tokenService.verifyAccessToken(accessToken);
    request.authUser = await this.authService.resolveAuthenticatedUser(payload);

    return true;
  }

  private readCookie(
    request: AuthenticatedRequest,
    name: string,
  ): string | undefined {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[name];

    return typeof value === 'string' ? value : undefined;
  }
}
