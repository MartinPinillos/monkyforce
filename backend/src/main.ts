import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const envFile = resolve(__dirname, '../../.env');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
