import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const ALGORITHM = 'scrypt';
const COST = 2 ** 17;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const MAX_MEMORY = 256 * 1024 * 1024;
const DUMMY_SALT = Buffer.alloc(SALT_BYTES, 0x5a);
const DUMMY_EXPECTED = Buffer.alloc(KEY_BYTES, 0xa5);

interface ParsedPasswordHash {
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  expected: Buffer;
}

@Injectable()
export class PasswordHasherService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derived = await this.derive(
      password,
      salt,
      COST,
      BLOCK_SIZE,
      PARALLELIZATION,
    );

    return [
      ALGORITHM,
      COST,
      BLOCK_SIZE,
      PARALLELIZATION,
      salt.toString('base64url'),
      derived.toString('base64url'),
    ].join('$');
  }

  async verify(password: string, encodedHash: string): Promise<boolean> {
    const parsed = this.parse(encodedHash);

    if (!parsed) {
      await this.burn(password);
      return false;
    }

    const actual = await this.derive(
      password,
      parsed.salt,
      parsed.cost,
      parsed.blockSize,
      parsed.parallelization,
    );

    return (
      actual.length === parsed.expected.length &&
      timingSafeEqual(actual, parsed.expected)
    );
  }

  async burn(password: string): Promise<void> {
    const actual = await this.derive(
      password,
      DUMMY_SALT,
      COST,
      BLOCK_SIZE,
      PARALLELIZATION,
    );

    timingSafeEqual(actual, DUMMY_EXPECTED);
  }

  private parse(encodedHash: string): ParsedPasswordHash | null {
    const [
      algorithm,
      costValue,
      blockSizeValue,
      parallelizationValue,
      salt,
      hash,
    ] = encodedHash.split('$');

    const cost = Number(costValue);
    const blockSize = Number(blockSizeValue);
    const parallelization = Number(parallelizationValue);
    const requiredMemory = 128 * cost * blockSize + 16 * 1024 * 1024;

    if (
      algorithm !== ALGORITHM ||
      !Number.isSafeInteger(cost) ||
      cost < 2 ** 14 ||
      cost > 2 ** 20 ||
      (cost & (cost - 1)) !== 0 ||
      !Number.isSafeInteger(blockSize) ||
      blockSize < 1 ||
      blockSize > 32 ||
      !Number.isSafeInteger(parallelization) ||
      parallelization < 1 ||
      parallelization > 16 ||
      requiredMemory > MAX_MEMORY ||
      !salt ||
      !hash
    ) {
      return null;
    }

    try {
      const saltBuffer = Buffer.from(salt, 'base64url');
      const hashBuffer = Buffer.from(hash, 'base64url');

      if (saltBuffer.length < SALT_BYTES || hashBuffer.length !== KEY_BYTES) {
        return null;
      }

      return {
        cost,
        blockSize,
        parallelization,
        salt: saltBuffer,
        expected: hashBuffer,
      };
    } catch {
      return null;
    }
  }

  private async derive(
    password: string,
    salt: Buffer,
    cost: number,
    blockSize: number,
    parallelization: number,
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      scrypt(
        password,
        salt,
        KEY_BYTES,
        { cost, blockSize, parallelization, maxmem: MAX_MEMORY },
        (error, derivedKey) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(derivedKey);
        },
      );
    });
  }
}
