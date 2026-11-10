import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthConfig {
  readonly secret = readSecret();
  readonly accessTtlSeconds = 15 * 60;
  readonly refreshTtlSeconds = 7 * 24 * 60 * 60;
  readonly secureCookies = process.env.NODE_ENV === 'production';
}

function readSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes');
  }
  return secret;
}
