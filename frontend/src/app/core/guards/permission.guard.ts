import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data['permissions'];
  const permissions = Array.isArray(required)
    ? required.filter((value): value is string => typeof value === 'string')
    : [];

  return auth.loadSession().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        });
      }

      return auth.hasPermissions(permissions)
        ? true
        : router.createUrlTree(['/forbidden']);
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
