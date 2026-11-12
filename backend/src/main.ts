import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { configureHttpSecurity } from './http-security';

async function bootstrap() {
  const envFile = resolve(__dirname, '../../.env');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureHttpSecurity(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
