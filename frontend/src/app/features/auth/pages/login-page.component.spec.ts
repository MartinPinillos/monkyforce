import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { AuthUser } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let auth: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    auth = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('does not submit an invalid form', () => {
    component.submit();
    expect(auth.login).not.toHaveBeenCalled();
    expect(component.form.controls.loginName.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('submits credentials and navigates after success', () => {
    auth.login.mockReturnValue(of(makeUser()));
    component.form.setValue({
      loginName: 'operator',
      password: 'secret',
    });

    component.submit();

    expect(auth.login).toHaveBeenCalledWith({
      loginName: 'operator',
      password: 'secret',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows a generic invalid credentials message for 401', () => {
    auth.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
          }),
      ),
    );
    component.form.setValue({
      loginName: 'operator',
      password: 'wrong',
    });

    component.submit();

    expect(component.errorMessage()).toBe('Usuario o contraseña incorrectos.');
    expect(component.loading()).toBe(false);
  });
});

function makeUser(): AuthUser {
  return {
    id: 1,
    loginName: 'operator',
    roles: [],
    permissions: [],
  };
}
