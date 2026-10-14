import { UnauthorizedException } from '@nestjs/common';
import type { Mocked } from 'vitest';
import type { AuthSessionsRepository } from './auth-sessions.repository.js';
import { AuthService } from './auth.service.js';
import type { AuthTokenPair } from './auth.types.js';
import { AuthTokenService } from './security/auth-token.service.js';
import { PasswordHasherService } from './security/password-hasher.service.js';
import type { UserEntity } from '../users/entities/user.entity.js';
import type { UsersRepository } from '../users/users.repository.js';

describe('AuthService', () => {
  let usersRepository: Mocked<UsersRepository>;
  let sessionsRepository: Mocked<AuthSessionsRepository>;
  let passwordHasher: Mocked<PasswordHasherService>;
  let tokenService: Mocked<AuthTokenService>;
  let service: AuthService;

  const tokenPair: AuthTokenPair = {
    accessToken: 'access',
    refreshToken: 'refresh',
    accessExpiresAt: new Date('2026-10-13T20:15:00Z'),
    refreshExpiresAt: new Date('2026-10-20T20:00:00Z'),
  };

  beforeEach(() => {
    usersRepository = {
      count: vi.fn(),
      create: vi.fn(),
      findByLoginNameWithAuthorization: vi.fn(),
      findByIdWithAuthorization: vi.fn(),
    };
    sessionsRepository = {
      create: vi.fn(),
      findActiveById: vi.fn(),
      rotate: vi.fn(),
      revoke: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
      burn: vi.fn(),
    } as unknown as Mocked<PasswordHasherService>;
    tokenService = {
      issuePair: vi.fn(),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      tryExtractSessionId: vi.fn(),
      hashRefreshToken: vi.fn().mockReturnValue('refresh-hash'),
    } as unknown as Mocked<AuthTokenService>;

    service = new AuthService(
      usersRepository,
      sessionsRepository,
      passwordHasher,
      tokenService,
    );
  });

  it('normalizes login, verifies password and creates a revocable session', async () => {
    const user = makeUser();
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    tokenService.issuePair.mockResolvedValue(tokenPair);
    sessionsRepository.create.mockImplementation(async (session) => ({
      ...session,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user,
    }));

    const result = await service.login({
      loginName: '  Operador  ',
      password: 'correcta',
    });

    expect(
      usersRepository.findByLoginNameWithAuthorization,
    ).toHaveBeenCalledWith('operador');
    expect(passwordHasher.verify).toHaveBeenCalledWith(
      'correcta',
      user.passwordHash,
    );
    expect(sessionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        refreshTokenHash: 'refresh-hash',
        expiresAt: tokenPair.refreshExpiresAt,
      }),
    );
    expect(result.user).toEqual(
      expect.objectContaining({ id: user.id, loginName: user.loginName }),
    );
  });

  it('does not reveal whether a login exists', async () => {
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(null);

    await expect(
      service.login({ loginName: 'missing', password: 'guess' }),
    ).rejects.toEqual(new UnauthorizedException('Invalid credentials'));
    expect(passwordHasher.burn).toHaveBeenCalledWith('guess');
  });

  it('rejects an inactive user after verifying its password', async () => {
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(
      makeUser({ isActive: false }),
    );
    passwordHasher.verify.mockResolvedValue(true);

    await expect(
      service.login({ loginName: 'operador', password: 'correcta' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(passwordHasher.verify).toHaveBeenCalledOnce();
    expect(sessionsRepository.create).not.toHaveBeenCalled();
  });

  it('rejects invalid passwords with the same generic error', async () => {
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(
      makeUser(),
    );
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      service.login({ loginName: 'operador', password: 'incorrecta' }),
    ).rejects.toEqual(new UnauthorizedException('Invalid credentials'));
  });
});

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: 1,
    loginName: 'operador',
    passwordHash: 'password-hash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
    ...overrides,
  } as UserEntity;
}
