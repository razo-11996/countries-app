import {
  map,
  take,
  filter,
  switchMap,
  shareReplay,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { byNameAsc } from '../../core/utils';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import type { CountryCardModel } from '../../ui/country-card/country-card.types';
import { CountryCardComponent } from '../../ui/country-card/country-card.component';
import { CountriesRepository, type ContinentsVm, type CountriesVm } from '../../core/data';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [CountryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-5">
      <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Countries</h1>
          <p class="mt-1 text-sm text-[var(--app-muted)]">
            Browse and inspect country details via GraphQL.
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="grid gap-1">
            <span class="text-xs font-medium text-[var(--app-muted)]">Search</span>
            <input
              #searchInput
              class="h-11 w-full rounded-xl bg-[var(--app-card)] px-3 text-sm shadow-sm ring-1 ring-[var(--app-border)] placeholder:text-[var(--app-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-fg)]/40"
              [value]="search()"
              (input)="search.set(searchInput.value)"
              placeholder="Name or code…"
            />
          </label>

          <label class="grid gap-1">
            <span class="text-xs font-medium text-[var(--app-muted)]">Continent</span>
            <select
              #continentSelect
              class="h-11 w-full rounded-xl bg-[var(--app-card)] px-3 text-sm shadow-sm ring-1 ring-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-fg)]/40"
              [value]="continentCode()"
              (change)="continentCode.set(continentSelect.value)"
            >
              <option value="">All</option>
              @for (c of continents(); track c.code) {
                <option [value]="c.code">{{ c.name }}</option>
              }
            </select>
          </label>
        </div>
      </header>

      @if (countriesVm().errors?.length) {
        <div
          class="rounded-2xl bg-[var(--app-card)] p-4 text-sm shadow-sm ring-1 ring-[var(--app-border)]"
        >
          <div class="font-semibold">Something went wrong.</div>
          <div class="mt-1 text-[var(--app-muted)]">
            {{ countriesVm().errors?.[0]?.message ?? 'Unknown GraphQL error' }}
          </div>
        </div>
      }

      @if (countriesVm().loading && countriesVm().countries.length === 0) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (i of skeleton(); track i) {
            <div
              class="animate-pulse rounded-2xl bg-[var(--app-card)] p-4 shadow-sm ring-1 ring-[var(--app-border)]"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="size-10 rounded-xl bg-[var(--app-bg)] ring-1 ring-[var(--app-border)]"
                  ></div>
                  <div class="space-y-2">
                    <div class="h-4 w-36 rounded bg-[var(--app-bg)]"></div>
                    <div class="h-3 w-24 rounded bg-[var(--app-bg)]"></div>
                  </div>
                </div>
                <div
                  class="h-7 w-14 rounded-full bg-[var(--app-bg)] ring-1 ring-[var(--app-border)]"
                ></div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="space-y-2">
                  <div class="h-3 w-12 rounded bg-[var(--app-bg)]"></div>
                  <div class="h-4 w-24 rounded bg-[var(--app-bg)]"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-3 w-14 rounded bg-[var(--app-bg)]"></div>
                  <div class="h-4 w-20 rounded bg-[var(--app-bg)]"></div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center justify-between text-sm text-[var(--app-muted)]">
          <div>
            Showing <span class="font-semibold text-[var(--app-fg)]">{{ countries().length }}</span>
          </div>
        </div>

        @if (countries().length === 0) {
          <div
            class="rounded-2xl bg-[var(--app-card)] p-6 text-sm shadow-sm ring-1 ring-[var(--app-border)]"
          >
            <div class="font-semibold">No results</div>
            <div class="mt-1 text-[var(--app-muted)]">Try clearing your filters.</div>
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (country of countries(); track country.code) {
              <app-country-card [country]="country" />
            }
          </div>
        }
      }
    </section>
  `,
})
export class CountriesPage {
  private readonly repo = inject(CountriesRepository);

  readonly search = signal('');
  readonly continentCode = signal('');

  private readonly continents$ = this.repo
    .watchContinents()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly continentsVm = toSignal(this.continents$, {
    initialValue: { loading: true, errors: null, continents: [] } satisfies ContinentsVm,
  });

  readonly continents = computed(() =>
    this.continentsVm().continents.slice().sort(byNameAsc),
  );

  private readonly search$ = toObservable(this.search);
  private readonly continentInitialized = signal(false);
  private readonly continent$ = toObservable(this.continentCode);
  private readonly continentInitialized$ = toObservable(this.continentInitialized);

  readonly countriesVm = toSignal(
    this.continents$.pipe(
      filter((vm) => !vm.loading),
      take(1),
      switchMap(() => {
        return combineLatest([this.search$, this.continent$, this.continentInitialized$]).pipe(
          filter(([, , initialized]) => initialized),
          map(([search, continentCode]) => ({
            search: (search ?? '').toString().trim(),
            continentCode: (continentCode ?? '').toString().trim(),
          })),
          debounceTime(250),
          distinctUntilChanged(
            (a, b) => a.search === b.search && a.continentCode === b.continentCode,
          ),
          switchMap(({ search, continentCode }) =>
            this.repo.watchCountries({ search, continentCode }),
          ),
        );
      }),
    ),
    { initialValue: { loading: true, errors: null, countries: [] } satisfies CountriesVm },
  );

  readonly countries = computed((): CountryCardModel[] => {
    return this.countriesVm()
      .countries.slice()
      .sort(byNameAsc)
      .map((c) => ({
        code: c.code,
        name: c.name,
        emoji: c.emoji,
        capital: c.capital,
        currency: c.currency,
        continent: c.continent,
      }));
  });

  readonly skeleton = computed(() => Array.from({ length: 12 }, (_, i) => i));

  constructor() {
    let didSetDefault = false;
    effect(() => {
      if (didSetDefault) return;
      if (this.continentCode()) return;
      const list = this.continents();
      const first = list[0];
      if (!first) return;

      didSetDefault = true;
      this.continentCode.set(first.code);
    });

    effect(() => {
      if (this.continentInitialized()) return;
      if (this.continentCode().trim()) this.continentInitialized.set(true);
    });
  }
}
