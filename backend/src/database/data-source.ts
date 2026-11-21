import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { CreateFabrics1795219200000 } from './migrations/1795219200000-create-fabrics';

config({ path: resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export default new DataSource({
  type: 'oracle',
  username: required('APP_DB_USERNAME'),
  password: required('APP_DB_PASSWORD'),
  connectString: process.env.APP_DB_CONNECT_STRING || 'localhost:1521/FREEPDB1',
  synchronize: false,
  migrationsRun: false,
  migrationsTransactionMode: 'none',
  migrationsTableName: 'MF_MIGRATIONS',
  entities: [],
  migrations: [CreateFabrics1795219200000],
});
