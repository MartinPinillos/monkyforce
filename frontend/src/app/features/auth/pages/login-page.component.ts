import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-shell">
      <section class="login-card" aria-labelledby="login-title">
        <p class="eyebrow">MonkyForce</p>
        <h1 id="login-title">Ingresar</h1>
        <p class="intro">Accedé a la gestión de producción textil.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label for="loginName">Usuario</label>
          <input
            id="loginName"
            type="text"
            formControlName="loginName"
            autocomplete="username"
            [attr.aria-invalid]="showLoginNameError()"
          />
          @if (showLoginNameError()) {
            <p class="field-error">Ingresá tu usuario.</p>
          }

          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            autocomplete="current-password"
            [attr.aria-invalid]="showPasswordError()"
          />
          @if (showPasswordError()) {
            <p class="field-error">Ingresá tu contraseña.</p>
          }

          @if (errorMessage()) {
            <p class="form-error" role="alert">{{ errorMessage() }}</p>
          }

          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      color: #17231d;
      background:
        radial-gradient(circle at top left, #dcefe2, transparent 35rem), #f5f7f5;
    }

    .login-shell {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
    }

    .login-card {
      width: min(28rem, 100%);
      padding: clamp(1.5rem, 5vw, 2.5rem);
      border: 1px solid #d8dfda;
      border-radius: 1.25rem;
      background: #fff;
      box-shadow: 0 1.5rem 4rem rgb(24 45 33 / 10%);
    }

    .eyebrow {
      margin: 0 0 0.5rem;
      color: #237047;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 8vw, 3rem);
    }

    .intro {
      margin: 0.75rem 0 2rem;
      color: #526058;
    }

    form {
      display: grid;
      gap: 0.65rem;
    }

    label {
      margin-top: 0.5rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 2.9rem;
      padding: 0.7rem 0.85rem;
      border: 1px solid #aebbb3;
      border-radius: 0.6rem;
      font: inherit;
    }

    input:focus-visible {
      outline: 3px solid rgb(35 112 71 / 25%);
      border-color: #237047;
    }

    input[aria-invalid='true'] {
      border-color: #a12626;
    }

    .field-error,
    .form-error {
      margin: 0;
      color: #8c2020;
      font-size: 0.9rem;
    }

    .form-error {
      margin-top: 0.65rem;
      padding: 0.75rem;
      border-radius: 0.55rem;
      background: #fff0f0;
    }

    button {
      min-height: 3rem;
      margin-top: 1rem;
      border: 0;
      border-radius: 0.65rem;
      color: #fff;
      background: #237047;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.65;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = new FormGroup({
    loginName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(128)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1024)],
    }),
  });

  showLoginNameError(): boolean {
    const control = this.form.controls.loginName;
    return control.invalid && (control.dirty || control.touched);
  }

  showPasswordError(): boolean {
    const control = this.form.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof HttpErrorResponse && error.status === 401
              ? 'Usuario o contraseña incorrectos.'
              : 'No pudimos iniciar sesión. Intentá nuevamente.',
          );
        },
      });
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/';
  }
}
