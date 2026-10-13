export function validateEnvironment(config: Record<string, unknown>) {
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_SERVICE_NAME',
    'DB_USERNAME',
    'DB_PASSWORD',
    'FRONTEND_ORIGIN',
  ];

  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return config;
}
