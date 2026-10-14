import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { BootstrapUserService } from '../features/auth/bootstrap-user.service.js';

const CONFIRMATION = 'CREATE_INITIAL_USER';

async function bootstrapInitialUser(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const config = app.get(ConfigService);
    assertCommandAuthorized(config);

    const result = await app.get(BootstrapUserService).execute({
      loginName: config.getOrThrow<string>('BOOTSTRAP_USER_LOGIN_NAME'),
      password: config.getOrThrow<string>('BOOTSTRAP_USER_PASSWORD'),
    });

    Logger.log(
      `Initial user ${result.status}: ${result.loginName} (id=${result.userId})`,
      'BootstrapUser',
    );
  } finally {
    await app.close();
  }
}

function assertCommandAuthorized(config: ConfigService): void {
  if (config.get<string>('BOOTSTRAP_USER_CONFIRM') !== CONFIRMATION) {
    throw new Error(`BOOTSTRAP_USER_CONFIRM must equal ${CONFIRMATION}`);
  }

  if (
    config.get<string>('NODE_ENV') === 'production' &&
    config.get<string>('BOOTSTRAP_USER_ALLOW_PRODUCTION') !== 'true'
  ) {
    throw new Error(
      'BOOTSTRAP_USER_ALLOW_PRODUCTION=true is required in production',
    );
  }
}

void bootstrapInitialUser().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  Logger.error(message, undefined, 'BootstrapUser');
  process.exitCode = 1;
});
