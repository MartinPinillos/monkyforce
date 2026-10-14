import { PasswordHasherService } from './password-hasher.service.js';

describe('PasswordHasherService', () => {
  const service = new PasswordHasherService();

  it('hashes and verifies a password without storing plaintext', async () => {
    const password = 'contraseña de prueba 🔐';
    const hash = await service.hash(password);

    expect(hash).not.toContain(password);
    await expect(service.verify(password, hash)).resolves.toBe(true);
    await expect(service.verify('incorrecta', hash)).resolves.toBe(false);
  });

  it('rejects malformed hashes after performing the dummy workload', async () => {
    await expect(service.verify('cualquiera', 'not-a-hash')).resolves.toBe(
      false,
    );
  });
});
