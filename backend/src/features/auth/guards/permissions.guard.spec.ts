import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequirePermissions } from '../decorators/require-permissions.decorator.js';
import type { AuthenticatedRequest } from '../auth.types.js';
import { PermissionsGuard } from './permissions.guard.js';

describe('PermissionsGuard', () => {
  const reflector = new Reflector();
  const guard = new PermissionsGuard(reflector);

  class ProtectedController {
    @RequirePermissions('CUTS_VIEW', 'CUTS_UPDATE')
    handler(): void {}
  }

  it('allows a user with every required permission', () => {
    const context = createContext(['CUTS_UPDATE', 'CUTS_VIEW', 'OTHER']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns 403 semantics when one permission is missing', () => {
    const context = createContext(['CUTS_VIEW']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  function createContext(permissions: string[]): ExecutionContext {
    const request = {
      authUser: {
        id: 1,
        loginName: 'user',
        isActive: true,
        roles: ['ROLE'],
        permissions,
      },
    } as AuthenticatedRequest;

    return {
      getHandler: () => ProtectedController.prototype.handler,
      getClass: () => ProtectedController,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }
});
