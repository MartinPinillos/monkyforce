import type { AuthenticatedUser } from './domain/authenticated-user.js';
import type { UserEntity } from './entities/user.entity.js';

export function mapToAuthenticatedUser(user: UserEntity): AuthenticatedUser {
  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const userRole of user.userRoles ?? []) {
    const role = userRole.role;

    if (!role?.isActive) {
      continue;
    }

    roles.add(role.code);

    for (const rolePermission of role.rolePermissions ?? []) {
      const permission = rolePermission.permission;

      if (permission?.isActive) {
        permissions.add(permission.code);
      }
    }
  }

  return {
    id: user.id,
    loginName: user.loginName,
    isActive: user.isActive,
    roles: [...roles].sort(),
    permissions: [...permissions].sort(),
  };
}
