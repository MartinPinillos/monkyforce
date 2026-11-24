import { scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(KEY_LENGTH * 2)}`;
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

export function normalizeLoginName(value: string): string {
  return value.trim().toLowerCase();
}

export async function verifyPassword(
  password: string,
  storedHash?: string,
): Promise<boolean> {
  const validHash =
    storedHash && /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(storedHash);
  const [salt, hash] = (validHash ? storedHash : DUMMY_HASH).split(':');
  const actual = await deriveKey(password, Buffer.from(salt, 'hex'));
  return (
    timingSafeEqual(actual, Buffer.from(hash, 'hex')) && Boolean(validHash)
  );
}
