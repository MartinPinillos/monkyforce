import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthCookieService } from './auth-cookie.service';
import { AuthTokenService } from './auth-token.service';
import { AuthConfig } from './auth.config';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthConfig, AuthTokenService, AuthCookieService],
  exports: [AuthTokenService, AuthCookieService],
})
export class AuthModule {}
