import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './env.validation.js';

const validEnvironment = {
  NODE_ENV: 'development',
  DB_HOST: 'localhost',
  DB_PORT: '1521',
  DB_SERVICE_NAME: 'FREEPDB1',
  DB_USERNAME: 'MONKYFORCE',
  DB_PASSWORD: 'test-password',
  FRONTEND_ORIGIN: 'http://localhost:4200',
  JWT_ACCESS_SECRET: 'access-secret-with-at-least-32-characters',
  JWT_REFRESH_SECRET: 'refresh-secret-with-at-least-32-characters',
};

describe('validateEnvironment', () => {
  it('accepts the local development configuration', () => {
    expect(validateEnvironment({ ...validEnvironment })).toBeTruthy();
  });

  it('requires independent access and refresh secrets', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        JWT_REFRESH_SECRET: validEnvironment.JWT_ACCESS_SECRET,
      }),
    ).toThrow('must be different');
  });

  it('requires HTTPS for the production frontend origin', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, NODE_ENV: 'production' }),
    ).toThrow('must use HTTPS');
  });
});
