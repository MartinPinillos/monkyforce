import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  finalize,
  Observable,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthUser } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';

let refreshRequest$: Observable<AuthUser> | null = null;

export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !isRefreshableApiRequest(request.url)
      ) {
        return throwError(() => error);
      }

      refreshRequest$ ??= auth.refreshSession().pipe(
        finalize(() => {
          refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

      return refreshRequest$.pipe(
        switchMap(() => next(request)),
        catchError((refreshError: unknown) => {
          auth.markAnonymous();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function isRefreshableApiRequest(url: string): boolean {
  if (!url.startsWith(environment.apiBaseUrl)) {
    return false;
  }

  return !['/auth/login', '/auth/refresh', '/auth/logout'].some((path) =>
    url.endsWith(path),
  );
}
