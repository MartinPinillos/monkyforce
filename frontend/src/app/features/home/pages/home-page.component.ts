import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-home-page',
  template: `
    <main class="home">
      <section>
        <p class="eyebrow">MonkyForce</p>
        <h1>Gestión de producción textil</h1>
        @if (auth.user(); as user) {
          <p>
            Sesión iniciada como <strong>{{ user.loginName }}</strong
            >.
          </p>
          <dl>
            <div>
              <dt>Roles activos</dt>
              <dd>
                {{ user.roles.length ? user.roles.join(', ') : 'Sin roles' }}
              </dd>
            </div>
            <div>
              <dt>Permisos efectivos</dt>
              <dd>
                {{
                  user.permissions.length
                    ? user.permissions.join(', ')
                    : 'Sin permisos'
                }}
              </dd>
            </div>
          </dl>
          @if (logoutError()) {
            <p class="error" role="alert">{{ logoutError() }}</p>
          }
          <button type="button" [disabled]="loggingOut()" (click)="logout()">
            {{ loggingOut() ? 'Cerrando sesión…' : 'Cerrar sesión' }}
          </button>
        }
      </section>
    </main>
  `,
  styles: `
    .home {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 2rem;
    }

    section {
      width: min(42rem, 100%);
      padding: clamp(1.5rem, 5vw, 3rem);
      border: 1px solid #d8dfda;
      border-radius: 1.25rem;
      background: #fff;
      box-shadow: 0 1.5rem 4rem rgb(24 45 33 / 10%);
    }

    .eyebrow {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    h1 {
      font-size: clamp(2rem, 8vw, 4rem);
      margin: 0.5rem 0 1rem;
    }

    dl {
      display: grid;
      gap: 1rem;
      margin: 2rem 0;
    }

    dl div {
      padding: 1rem;
      border-radius: 0.75rem;
      background: #f1f5f2;
    }

    dt {
      font-weight: 800;
    }

    dd {
      margin: 0.35rem 0 0;
      overflow-wrap: anywhere;
    }

    button {
      min-height: 2.8rem;
      padding: 0.65rem 1rem;
      border: 0;
      border-radius: 0.6rem;
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

    .error {
      color: #8c2020;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loggingOut = signal(false);
  readonly logoutError = signal<string | null>(null);

  logout(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);
    this.logoutError.set(null);
    this.auth
      .logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/login']),
        error: () => {
          this.logoutError.set(
            'La sesión local se cerró, pero no se pudo confirmar con el servidor.',
          );
          void this.router.navigate(['/login']);
        },
      });
  }
}
