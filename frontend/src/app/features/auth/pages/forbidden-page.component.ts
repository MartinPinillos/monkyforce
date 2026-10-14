import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink],
  template: `
    <main class="message-page">
      <section>
        <p class="eyebrow">403</p>
        <h1>Sin permisos</h1>
        <p>Tu sesión está activa, pero no tenés permiso para esta operación.</p>
        <a routerLink="/">Volver al inicio</a>
      </section>
    </main>
  `,
  styles: `
    .message-page {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 2rem;
      text-align: center;
    }

    .eyebrow {
      color: #a12626;
      font-weight: 800;
      letter-spacing: 0.12em;
    }

    a {
      color: #237047;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPageComponent {}
