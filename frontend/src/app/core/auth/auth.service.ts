import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AuthResponse,
  AuthStatus,
  AuthUser,
  LoginRequest,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;
  private readonly userState = signal<AuthUser | null>(null);
  private readonly statusState = signal<AuthStatus>('unknown');
  private sessionRequest$: Observable<AuthUser | null> | null = null;

  readonly user = this.userState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly isAuthenticated = computed(
    () => this.statusState() === 'authenticated' && this.userState() !== null,
  );

  login(credentials: LoginRequest): Observable<AuthUser> {
    this.statusState.set('loading');

    return this.http
      .post<AuthResponse>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(({ user }) => this.setAuthenticated(user)),
        map(({ user }) => user),
        catchError((error: unknown) => {
          this.markAnonymous();
          return throwError(() => error);
        }),
      );
  }

  loadSession(force = false): Observable<AuthUser | null> {
    if (!force && this.statusState() === 'authenticated') {
      return of(this.userState());
    }

    if (this.sessionRequest$) {
      return this.sessionRequest$;
    }

    this.statusState.set('loading');
    this.sessionRequest$ = this.http
      .get<AuthResponse>(`${this.authUrl}/me`)
      .pipe(
        tap(({ user }) => this.setAuthenticated(user)),
        map(({ user }) => user),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.markAnonymous();
            return of(null);
          }

          this.statusState.set('unknown');
          return throwError(() => error);
        }),
        finalize(() => {
          this.sessionRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.sessionRequest$;
  }

  refreshSession(): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, {}).pipe(
      tap(({ user }) => this.setAuthenticated(user)),
      map(({ user }) => user),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout`, {}).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return of(undefined);
        }

        return throwError(() => error);
      }),
      finalize(() => this.markAnonymous()),
    );
  }

  hasPermissions(required: readonly string[]): boolean {
    const available = new Set(this.userState()?.permissions ?? []);
    return required.every((permission) => available.has(permission));
  }

  markAnonymous(): void {
    this.userState.set(null);
    this.statusState.set('anonymous');
  }

  private setAuthenticated(user: AuthUser): void {
    this.userState.set(user);
    this.statusState.set('authenticated');
  }
}
