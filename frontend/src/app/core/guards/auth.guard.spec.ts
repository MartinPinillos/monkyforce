import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import type { AuthUser } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('authentication guards', () => {
  let router: Router;
  let auth: {
    loadSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    auth = { loadSession: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
  });

  it('allows an authenticated user', async () => {
    auth.loadSession.mockReturnValue(of(makeUser()));
    const result = await evaluate(authGuard, '/secure');
    expect(result).toBe(true);
  });

  it('redirects an anonymous user to login with returnUrl', async () => {
    auth.loadSession.mockReturnValue(of(null));
    const result = await evaluate(authGuard, '/secure');

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Fsecure',
    );
  });

  it('keeps authenticated users out of the login page', async () => {
    auth.loadSession.mockReturnValue(of(makeUser()));
    const result = await evaluate(guestGuard, '/login');
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  async function evaluate(
    guard: typeof authGuard,
    url: string,
  ): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );

    const resolved = isObservable(result)
      ? await firstValueFrom(result)
      : await result;

    return resolved as boolean | UrlTree;
  }
});

function makeUser(): AuthUser {
  return {
    id: 1,
    loginName: 'operator',
    roles: [],
    permissions: [],
  };
}
