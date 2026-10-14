import { DataSource } from 'typeorm';
import { CreateAuthRbacFoundation1791931262000 } from '../database/migrations/1791931262000-create-auth-rbac-foundation.js';
import { AuthSessionEntity } from '../src/features/auth/entities/auth-session.entity.js';
import { AuthSessionsTypeormRepository } from '../src/features/auth/infrastructure/auth-sessions.typeorm-repository.js';
import { PasswordHasherService } from '../src/features/auth/security/password-hasher.service.js';
import { PermissionEntity } from '../src/features/rbac/entities/permission.entity.js';
import { RolePermissionEntity } from '../src/features/rbac/entities/role-permission.entity.js';
import { RoleEntity } from '../src/features/rbac/entities/role.entity.js';
import { UserRoleEntity } from '../src/features/rbac/entities/user-role.entity.js';
import { UserEntity } from '../src/features/users/entities/user.entity.js';
import { UsersTypeormRepository } from '../src/features/users/infrastructure/users.typeorm-repository.js';
import { mapToAuthenticatedUser } from '../src/features/users/users.mapper.js';

const describeOracle =
  process.env.RUN_ORACLE_TESTS === 'true' ? describe : describe.skip;

describeOracle('Auth/RBAC persistence (Oracle)', () => {
  const loginName = 'test_auth_rbac';
  const roleCode = 'TEST_AUTH_ROLE';
  const permissionCode = 'TEST_AUTH_ACCESS';
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'oracle',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 1521),
      serviceName: process.env.DB_SERVICE_NAME ?? 'FREEPDB1',
      username: process.env.DB_USERNAME ?? 'MONKYFORCE',
      password: process.env.DB_PASSWORD ?? 'MonkyForceDev_2026',
      entities: [
        UserEntity,
        RoleEntity,
        PermissionEntity,
        UserRoleEntity,
        RolePermissionEntity,
        AuthSessionEntity,
      ],
      migrations: [CreateAuthRbacFoundation1791931262000],
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
    await cleanup(dataSource);
  }, 180_000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await cleanup(dataSource);
      await dataSource.destroy();
    }
  });

  it('persists multiple-role authorization and revocable sessions', async () => {
    const users = dataSource.getRepository(UserEntity);
    const roles = dataSource.getRepository(RoleEntity);
    const permissions = dataSource.getRepository(PermissionEntity);
    const userRoles = dataSource.getRepository(UserRoleEntity);
    const rolePermissions = dataSource.getRepository(RolePermissionEntity);
    const passwordHash = await new PasswordHasherService().hash(
      'test password supplied at runtime',
    );

    const user = await users.save(
      users.create({
        loginName,
        passwordHash,
        isActive: true,
      }),
    );
    const role = await roles.save(
      roles.create({ code: roleCode, description: null, isActive: true }),
    );
    const permission = await permissions.save(
      permissions.create({
        code: permissionCode,
        description: null,
        isActive: true,
      }),
    );
    await userRoles.save(
      userRoles.create({ userId: user.id, roleId: role.id }),
    );
    await rolePermissions.save(
      rolePermissions.create({
        roleId: role.id,
        permissionId: permission.id,
      }),
    );

    const usersRepository = new UsersTypeormRepository(users);
    const persisted =
      await usersRepository.findByLoginNameWithAuthorization(loginName);

    expect(persisted).not.toBeNull();
    expect(mapToAuthenticatedUser(persisted!)).toEqual(
      expect.objectContaining({
        roles: [roleCode],
        permissions: [permissionCode],
      }),
    );

    const sessionRepository = new AuthSessionsTypeormRepository(
      dataSource.getRepository(AuthSessionEntity),
    );
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60_000);
    await sessionRepository.create({
      id: '00000000-0000-4000-8000-000000000010',
      userId: user.id,
      refreshTokenHash: 'a'.repeat(64),
      expiresAt,
    });

    await expect(
      sessionRepository.findActiveById(
        '00000000-0000-4000-8000-000000000010',
        now,
      ),
    ).resolves.not.toBeNull();
    await expect(
      sessionRepository.rotate(
        '00000000-0000-4000-8000-000000000010',
        'a'.repeat(64),
        'b'.repeat(64),
        expiresAt,
        now,
      ),
    ).resolves.toBe(true);
    await expect(
      sessionRepository.rotate(
        '00000000-0000-4000-8000-000000000010',
        'a'.repeat(64),
        'c'.repeat(64),
        expiresAt,
        now,
      ),
    ).resolves.toBe(false);

    await sessionRepository.revoke(
      '00000000-0000-4000-8000-000000000010',
      new Date(),
    );
    await expect(
      sessionRepository.findActiveById(
        '00000000-0000-4000-8000-000000000010',
        now,
      ),
    ).resolves.toBeNull();
  });
});

async function cleanup(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(UserEntity);
  const roles = dataSource.getRepository(RoleEntity);
  const permissions = dataSource.getRepository(PermissionEntity);
  const user = await users.findOne({ where: { loginName: 'test_auth_rbac' } });
  const role = await roles.findOne({ where: { code: 'TEST_AUTH_ROLE' } });
  const permission = await permissions.findOne({
    where: { code: 'TEST_AUTH_ACCESS' },
  });

  if (user) {
    await users.remove(user);
  }
  if (role) {
    await roles.remove(role);
  }
  if (permission) {
    await permissions.remove(permission);
  }
}
