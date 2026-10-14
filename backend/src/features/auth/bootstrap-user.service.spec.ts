import type { Mocked } from 'vitest';
import type { UserEntity } from '../users/entities/user.entity.js';
import type { UsersRepository } from '../users/users.repository.js';
import { BootstrapUserService } from './bootstrap-user.service.js';
import { PasswordHasherService } from './security/password-hasher.service.js';

describe('BootstrapUserService', () => {
  let usersRepository: Mocked<UsersRepository>;
  let passwordHasher: PasswordHasherService;
  let service: BootstrapUserService;

  beforeEach(() => {
    usersRepository = {
      count: vi.fn(),
      create: vi.fn(),
      findByLoginNameWithAuthorization: vi.fn(),
      findByIdWithAuthorization: vi.fn(),
    };
    passwordHasher = new PasswordHasherService();
    service = new BootstrapUserService(usersRepository, passwordHasher);
  });

  it('normalizes the login and persists a valid password hash for an empty database', async () => {
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(null);
    usersRepository.count.mockResolvedValue(0);
    usersRepository.create.mockImplementation(async (input) =>
      makeUser({ id: 7, ...input }),
    );

    const result = await service.execute({
      loginName: '  Initial.User  ',
      password: 'secret supplied by the operator',
    });

    const created = usersRepository.create.mock.calls[0]?.[0];

    expect(created?.loginName).toBe('initial.user');
    expect(created?.isActive).toBe(true);
    expect(created?.passwordHash).toMatch(/^scrypt\$/);
    await expect(
      passwordHasher.verify(
        'secret supplied by the operator',
        created?.passwordHash ?? '',
      ),
    ).resolves.toBe(true);
    expect(result).toEqual({
      status: 'created',
      userId: 7,
      loginName: 'initial.user',
    });
  });

  it('is idempotent when the same normalized user already exists', async () => {
    const hashSpy = vi.spyOn(passwordHasher, 'hash');
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(
      makeUser({ id: 3, loginName: 'initial.user' }),
    );

    await expect(
      service.execute({ loginName: ' INITIAL.USER ', password: 'unused' }),
    ).resolves.toEqual({
      status: 'already-exists',
      userId: 3,
      loginName: 'initial.user',
    });
    expect(usersRepository.count).not.toHaveBeenCalled();
    expect(hashSpy).not.toHaveBeenCalled();
    expect(usersRepository.create).not.toHaveBeenCalled();
  });

  it('refuses to create another user after bootstrap', async () => {
    const hashSpy = vi.spyOn(passwordHasher, 'hash');
    usersRepository.findByLoginNameWithAuthorization.mockResolvedValue(null);
    usersRepository.count.mockResolvedValue(1);

    await expect(
      service.execute({ loginName: 'second', password: 'unused' }),
    ).rejects.toThrow('an initial user already exists');
    expect(hashSpy).not.toHaveBeenCalled();
    expect(usersRepository.create).not.toHaveBeenCalled();
  });
});

function makeUser(overrides: Partial<UserEntity>): UserEntity {
  return {
    id: 1,
    loginName: 'initial.user',
    passwordHash: 'stored-hash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
    ...overrides,
  } as UserEntity;
}
