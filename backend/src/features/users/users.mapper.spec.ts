import type { PermissionEntity } from '../rbac/entities/permission.entity.js';
import type { RoleEntity } from '../rbac/entities/role.entity.js';
import type { RolePermissionEntity } from '../rbac/entities/role-permission.entity.js';
import type { UserRoleEntity } from '../rbac/entities/user-role.entity.js';
import type { UserEntity } from './entities/user.entity.js';
import { mapToAuthenticatedUser } from './users.mapper.js';

describe('mapToAuthenticatedUser', () => {
  it('accumulates active permissions from multiple active roles', () => {
    const user = makeUser([
      makeRole('CUTTER', ['CUTS_VIEW', 'CUTS_CREATE']),
      makeRole('READER', ['CUTS_VIEW', 'ROLLS_VIEW']),
    ]);

    expect(mapToAuthenticatedUser(user)).toEqual({
      id: 7,
      loginName: 'operador',
      isActive: true,
      roles: ['CUTTER', 'READER'],
      permissions: ['CUTS_CREATE', 'CUTS_VIEW', 'ROLLS_VIEW'],
    });
  });

  it('ignores inactive roles and permissions', () => {
    const activeRole = makeRole('ACTIVE', ['ALLOWED', 'DISABLED_PERMISSION']);
    activeRole.rolePermissions[1].permission.isActive = false;
    const inactiveRole = makeRole('INACTIVE', ['SHOULD_NOT_APPEAR']);
    inactiveRole.isActive = false;

    expect(
      mapToAuthenticatedUser(makeUser([activeRole, inactiveRole])),
    ).toEqual(
      expect.objectContaining({
        roles: ['ACTIVE'],
        permissions: ['ALLOWED'],
      }),
    );
  });
});

function makeUser(roles: RoleEntity[]): UserEntity {
  return {
    id: 7,
    loginName: 'operador',
    passwordHash: 'hidden',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: roles.map(
      (role, index) =>
        ({
          userId: 7,
          roleId: index + 1,
          role,
          assignedAt: new Date(),
        }) as UserRoleEntity,
    ),
  } as UserEntity;
}

function makeRole(code: string, permissionCodes: string[]): RoleEntity {
  const role = {
    id: Math.floor(Math.random() * 1000) + 1,
    code,
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
    rolePermissions: [],
  } as RoleEntity;

  role.rolePermissions = permissionCodes.map((permissionCode, index) => {
    const permission = {
      id: index + 1,
      code: permissionCode,
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rolePermissions: [],
    } as PermissionEntity;

    return {
      roleId: role.id,
      permissionId: permission.id,
      role,
      permission,
      assignedAt: new Date(),
    } as RolePermissionEntity;
  });

  return role;
}
