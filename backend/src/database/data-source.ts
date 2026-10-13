import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'oracle',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 1521),
  serviceName: process.env.DB_SERVICE_NAME ?? 'FREEPDB1',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['src/**/*.entity.ts'],
  migrations: ['database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
