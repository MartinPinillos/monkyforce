import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import type { AuthUser } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { permissionGuard } from './permission.guard';

describe('permissionGuard', () => {
  let router: Router;
  let auth: {
    loadSession: ReturnType<typeof vi.fn>;
    hasPermissions: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    auth = {
      loadSession: vi.fn(),
      hasPermissions: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
  });

  it('allows an authenticated user with every required permission', async () => {
    auth.loadSession.mockReturnValue(of(makeUser()));
    auth.hasPermissions.mockReturnValue(true);

    const result = await evaluate(['CUTS_VIEW', 'CUTS_UPDATE']);

    expect(result).toBe(true);
    expect(auth.hasPermissions).toHaveBeenCalledWith([
      'CUTS_VIEW',
      'CUTS_UPDATE',
    ]);
  });

  it('redirects an authenticated user without permission to forbidden', async () => {
    auth.loadSession.mockReturnValue(of(makeUser()));
    auth.hasPermissions.mockReturnValue(false);

    const result = await evaluate(['CUTS_UPDATE']);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/forbidden');
  });

  it('redirects an anonymous user to login without checking permissions', async () => {
    auth.loadSession.mockReturnValue(of(null));

    const result = await evaluate(['CUTS_VIEW']);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Fsecure',
    );
    expect(auth.hasPermissions).not.toHaveBeenCalled();
  });

  async function evaluate(permissions: string[]): Promise<boolean | UrlTree> {
    const route = {
      data: { permissions },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/secure' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(route, state),
    );

    return (await firstValueFrom(result as ReturnType<typeof of>)) as
      boolean | UrlTree;
  }
});

function makeUser(): AuthUser {
  return {
    id: 1,
    loginName: 'operator',
    roles: ['TEST_ROLE'],
    permissions: ['CUTS_VIEW', 'CUTS_UPDATE'],
  };
}
