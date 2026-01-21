import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p class="text-sm text-[var(--app-muted)]">The page you’re looking for doesn’t exist.</p>
      <app-button [routerLink]="'/'">
        Go back home
      </app-button>
    </section>
  `,
})
export class NotFoundPage {}
