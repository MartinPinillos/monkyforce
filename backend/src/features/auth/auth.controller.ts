import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.constants.js';
import { Public } from './decorators/public.decorator.js';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthCookieService } from './security/auth-cookie.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: AuthCookieService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia una sesión web' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) response: unknown,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(credentials);
    this.cookieService.set(response, result.tokens);

    return { user: AuthUserDto.from(result.user) };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rota y renueva la sesión web' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido' })
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: unknown,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.refresh(
      this.readCookie(request, REFRESH_TOKEN_COOKIE),
    );
    this.cookieService.set(response, result.tokens);

    return { user: AuthUserDto.from(result.user) };
  }

  @Get('me')
  @ApiOperation({ summary: 'Devuelve el usuario de la sesión actual' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Sesión ausente o inválida' })
  me(@Req() request: AuthenticatedRequest): AuthResponseDto {
    if (!request.authUser) {
      throw new UnauthorizedException('Authentication is required');
    }

    return { user: AuthUserDto.from(request.authUser) };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoca y elimina la sesión web' })
  @ApiNoContentResponse()
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: unknown,
  ): Promise<void> {
    await this.authService.logout(
      this.readCookie(request, ACCESS_TOKEN_COOKIE),
      this.readCookie(request, REFRESH_TOKEN_COOKIE),
    );
    this.cookieService.clear(response);
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
