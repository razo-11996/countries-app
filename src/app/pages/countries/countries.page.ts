import {
  map,
  take,
  filter,
  switchMap,
  shareReplay,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import {
  effect,
  inject,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { combineLatest } from 'rxjs';
import { byNameAsc } from '../../core/utils';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import type { CountryCardModel } from '../../ui/country-card/country-card.types';
import { CountryCardComponent } from '../../ui/country-card/country-card.component';
import { CountriesRepository, type ContinentsVm, type CountriesVm } from '../../core/data';

@Component({
  standalone: true,
  imports: [CountryCardComponent],
  styleUrl: './countries.page.scss',
  templateUrl: './countries.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  readonly continents = computed(() => this.continentsVm().continents.slice().sort(byNameAsc));

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
