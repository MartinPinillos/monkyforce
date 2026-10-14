import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { BootstrapUserService } from './bootstrap-user.service.js';
import { AUTH_SESSIONS_REPOSITORY } from './auth-sessions.repository.js';
import { AuthSessionEntity } from './entities/auth-session.entity.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { AuthSessionsTypeormRepository } from './infrastructure/auth-sessions.typeorm-repository.js';
import { AuthCookieService } from './security/auth-cookie.service.js';
import { AuthTokenService } from './security/auth-token.service.js';
import { PasswordHasherService } from './security/password-hasher.service.js';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    TypeOrmModule.forFeature([AuthSessionEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    BootstrapUserService,
    AuthCookieService,
    AuthTokenService,
    PasswordHasherService,
    AuthSessionsTypeormRepository,
    {
      provide: AUTH_SESSIONS_REPOSITORY,
      useExisting: AuthSessionsTypeormRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [
    AuthService,
    AuthTokenService,
    BootstrapUserService,
    PasswordHasherService,
    JwtModule,
  ],
})
export class AuthModule {}
