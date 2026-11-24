import type { DataSourceOptions } from 'typeorm';
import { AuthSession } from '../auth/auth-session.entity';
import { User } from '../users/user.entity';
import { CreateUsers1794787200000 } from './migrations/1794787200000-create-users';
import { CreateAuthSessions1794787200001 } from './migrations/1794787200001-create-auth-sessions';

export function databaseOptions(): DataSourceOptions {
  const { APP_DB_USERNAME, APP_DB_PASSWORD, APP_DB_CONNECT_STRING } =
    process.env;
  if (!APP_DB_USERNAME || !APP_DB_PASSWORD) {
    throw new Error('APP_DB_USERNAME and APP_DB_PASSWORD are required');
  }

  return {
    type: 'oracle',
    connectString: APP_DB_CONNECT_STRING ?? '127.0.0.1:1521/FREEPDB1',
    username: APP_DB_USERNAME,
    password: APP_DB_PASSWORD,
    entities: [User, AuthSession],
    migrations: [CreateUsers1794787200000, CreateAuthSessions1794787200001],
    migrationsTransactionMode: 'none',
    synchronize: false,
  };
}
