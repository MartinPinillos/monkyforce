import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { ConfigService } from '@nestjs/config';

export function createDatabaseOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'oracle',
    host: config.getOrThrow<string>('DB_HOST'),
    port: Number(config.getOrThrow<string>('DB_PORT')),
    serviceName: config.getOrThrow<string>('DB_SERVICE_NAME'),
    username: config.getOrThrow<string>('DB_USERNAME'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    autoLoadEntities: true,
    synchronize: false,
    logging: config.get<string>('DB_LOGGING') === 'true',
  };
}
