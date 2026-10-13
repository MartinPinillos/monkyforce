import { expect, test } from '@playwright/test';

test('completes the critical login and logout UI flow', async ({ page }) => {
  let authenticated = false;

  await page.route('**/api/auth/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path.endsWith('/auth/login')) {
      expect(request.postDataJSON()).toEqual({
        loginName: 'operator',
        password: 'correct password',
      });
      authenticated = true;
      await route.fulfill({ status: 200, json: authResponse() });
      return;
    }

    if (path.endsWith('/auth/logout')) {
      authenticated = false;
      await route.fulfill({ status: 204 });
      return;
    }

    if (path.endsWith('/auth/me') || path.endsWith('/auth/refresh')) {
      await route.fulfill(
        authenticated
          ? { status: 200, json: authResponse() }
          : {
              status: 401,
              json: { statusCode: 401, message: 'Authentication required' },
            },
      );
      return;
    }

    await route.abort();
  });

  await page.goto('/login');
  await page.getByLabel('Usuario').fill('operator');
  await page.getByLabel('Contraseña').fill('correct password');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: 'Gestión de producción textil' }),
  ).toBeVisible();
  await expect(page.getByText('Sesión iniciada como')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Ingresar' })).toBeVisible();
});

function authResponse() {
  return {
    user: {
      id: 1,
      loginName: 'operator',
      roles: ['TEST_ROLE'],
      permissions: ['TEST_ACCESS'],
    },
  };
}
