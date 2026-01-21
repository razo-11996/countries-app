import { RouterLink } from '@angular/router';
import { Component, input } from '@angular/core';
import type { CountryCardModel } from './country-card.types';

@Component({
  selector: 'app-country-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      class="group block rounded-2xl bg-[var(--app-card)] p-4 shadow-sm ring-1 ring-[var(--app-border)] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--app-fg)]/40"
      [routerLink]="['/country', country().code]"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-3">
            <div class="text-3xl leading-none" aria-hidden="true">{{ country().emoji }}</div>
            <div class="min-w-0">
              <div class="truncate text-base font-semibold tracking-tight">
                {{ country().name }}
              </div>
              <div class="mt-0.5 text-xs text-[var(--app-muted)]">
                {{ country().code }} · {{ country().continent?.name ?? '—' }}
              </div>
            </div>
          </div>
        </div>

        <span
          class="mt-1 inline-flex items-center rounded-full bg-[var(--app-bg)] px-2.5 py-1 text-xs font-medium text-[var(--app-muted)] ring-1 ring-[var(--app-border)]"
        >
          View
        </span>
      </div>

      <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="min-w-0">
          <dt class="text-xs text-[var(--app-muted)]">Capital</dt>
          <dd class="truncate font-medium">{{ country().capital ?? '—' }}</dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-[var(--app-muted)]">Currency</dt>
          <dd class="truncate font-medium">{{ country().currency ?? '—' }}</dd>
        </div>
      </dl>
    </a>
  `,
})
export class CountryCardComponent {
  readonly country = input.required<CountryCardModel>();
}
