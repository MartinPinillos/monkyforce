import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { authSessionInterceptor } from '../http/auth-session.interceptor';
import { credentialsInterceptor } from '../http/credentials.interceptor';
import type { AuthUser } from './auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const user: AuthUser = {
    id: 1,
    loginName: 'operator',
    roles: ['TEST_ROLE'],
    permissions: ['TEST_ACCESS'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(
          withInterceptors([authSessionInterceptor, credentialsInterceptor]),
        ),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('logs in without exposing or storing a token', () => {
    let result: AuthUser | undefined;
    service
      .login({ loginName: 'operator', password: 'secret' })
      .subscribe((value) => (result = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      loginName: 'operator',
      password: 'secret',
    });
    request.flush({ user });

    expect(result).toEqual(user);
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('loads /me, refreshes once after 401 and retries the request', () => {
    let result: AuthUser | null | undefined;
    service.loadSession().subscribe((value) => (result = value));

    const firstMe = http.expectOne(`${environment.apiBaseUrl}/auth/me`);
    firstMe.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refresh = http.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    expect(refresh.request.withCredentials).toBe(true);
    refresh.flush({ user });

    const retriedMe = http.expectOne(`${environment.apiBaseUrl}/auth/me`);
    retriedMe.flush({ user });

    expect(result).toEqual(user);
    expect(service.status()).toBe('authenticated');
  });

  it('marks the session anonymous when refresh also returns 401', () => {
    let result: AuthUser | null | undefined;
    service.loadSession().subscribe((value) => (result = value));

    http
      .expectOne(`${environment.apiBaseUrl}/auth/me`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    http
      .expectOne(`${environment.apiBaseUrl}/auth/refresh`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(result).toBeNull();
    expect(service.status()).toBe('anonymous');
    expect(service.user()).toBeNull();
  });

  it('clears local state after logout', () => {
    service.login({ loginName: 'operator', password: 'secret' }).subscribe();
    http.expectOne(`${environment.apiBaseUrl}/auth/login`).flush({ user });

    service.logout().subscribe();
    const logout = http.expectOne(`${environment.apiBaseUrl}/auth/logout`);
    expect(logout.request.withCredentials).toBe(true);
    logout.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.status()).toBe('anonymous');
    expect(service.user()).toBeNull();
  });
});
