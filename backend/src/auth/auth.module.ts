import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSession } from './auth-session.entity';
import { AuthTokenService } from './auth-token.service';
import { AuthConfig } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, AuthSession]),
  ],
  controllers: [AuthController],
  providers: [AuthConfig, AuthTokenService, AuthCookieService, AuthService],
  exports: [AuthTokenService, AuthCookieService],
})
export class AuthModule {}
