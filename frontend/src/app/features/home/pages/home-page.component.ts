import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `
    <main class="home">
      <section>
        <p class="eyebrow">MonkyForce</p>
        <h1>Gestión de producción textil</h1>
        <p>
          Foundation frontend inicializada. Las features se implementarán
          mediante SPEC.
        </p>
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
