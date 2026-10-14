const VALID_NODE_ENVIRONMENTS = new Set(['development', 'test', 'production']);

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_SERVICE_NAME',
    'DB_USERNAME',
    'DB_PASSWORD',
    'FRONTEND_ORIGIN',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  const nodeEnvironment = String(config.NODE_ENV ?? 'development');

  if (!VALID_NODE_ENVIRONMENTS.has(nodeEnvironment)) {
    throw new Error('NODE_ENV must be development, test or production');
  }

  const frontendOrigin = validateOrigin(String(config.FRONTEND_ORIGIN));
  const accessSecret = String(config.JWT_ACCESS_SECRET);
  const refreshSecret = String(config.JWT_REFRESH_SECRET);

  if (
    nodeEnvironment === 'production' &&
    frontendOrigin.protocol !== 'https:'
  ) {
    throw new Error('FRONTEND_ORIGIN must use HTTPS in production');
  }

  validateSecret('JWT_ACCESS_SECRET', accessSecret, nodeEnvironment);
  validateSecret('JWT_REFRESH_SECRET', refreshSecret, nodeEnvironment);

  if (accessSecret === refreshSecret) {
    throw new Error('JWT access and refresh secrets must be different');
  }
  validatePositiveInteger(config, 'JWT_ACCESS_TTL_SECONDS', 900);
  validatePositiveInteger(config, 'JWT_REFRESH_TTL_SECONDS', 604800);

  return config;
}

function validateOrigin(value: string): URL {
  let origin: URL;

  try {
    origin = new URL(value);
  } catch {
    throw new Error('FRONTEND_ORIGIN must be a serialized HTTP(S) origin');
  }

  if (
    origin.origin !== value ||
    !['http:', 'https:'].includes(origin.protocol)
  ) {
    throw new Error('FRONTEND_ORIGIN must be a serialized HTTP(S) origin');
  }

  return origin;
}

function validateSecret(
  name: string,
  value: string,
  nodeEnvironment: string,
): void {
  if (value.length < 32) {
    throw new Error(`${name} must contain at least 32 characters`);
  }

  if (
    nodeEnvironment === 'production' &&
    /^change-me(?:-|$)/i.test(value.trim())
  ) {
    throw new Error(`${name} must not use an example value in production`);
  }
}

function validatePositiveInteger(
  config: Record<string, unknown>,
  key: string,
  fallback: number,
): void {
  const value = Number(config[key] ?? fallback);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
}
