import { ActivatedRoute } from '@angular/router';
import { requiredUpperParam$ } from '../../core/utils';
import { shareReplay, switchMap } from 'rxjs/operators';
import { ButtonComponent } from '../../ui/button/button.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LeafletMapComponent } from '../../ui/leaflet-map/leaflet-map.component';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CountriesRepository, CountryInsightsService, type CountryVm } from '../../core/data';

@Component({
  standalone: true,
  imports: [LeafletMapComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-5">
      <app-button [routerLink]="'/'" extraClass="mb-2">
        <span aria-hidden="true">←</span>
        Back
      </app-button>

      @if (vm().errors?.length) {
        <div
          class="rounded-2xl bg-[var(--app-card)] p-4 text-sm shadow-sm ring-1 ring-[var(--app-border)]"
        >
          <div class="font-semibold">Couldn’t load country.</div>
          <div class="mt-1 text-[var(--app-muted)]">
            {{ vm().errors?.[0]?.message ?? 'Unknown GraphQL error' }}
          </div>
        </div>
      }

      @if (vm().loading && !vm().country) {
        <div
          class="animate-pulse rounded-2xl bg-[var(--app-card)] p-6 shadow-sm ring-1 ring-[var(--app-border)]"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div
                class="size-12 rounded-2xl bg-[var(--app-bg)] ring-1 ring-[var(--app-border)]"
              ></div>
              <div class="space-y-2">
                <div class="h-5 w-48 rounded bg-[var(--app-bg)]"></div>
                <div class="h-4 w-32 rounded bg-[var(--app-bg)]"></div>
              </div>
            </div>
          </div>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            @for (i of skeleton(); track i) {
              <div class="space-y-2">
                <div class="h-3 w-20 rounded bg-[var(--app-bg)]"></div>
                <div class="h-4 w-40 rounded bg-[var(--app-bg)]"></div>
              </div>
            }
          </div>
        </div>
      } @else if (vm().country) {
        <div class="rounded-2xl bg-[var(--app-card)] p-6 shadow-sm ring-1 ring-[var(--app-border)]">
          <header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-center gap-4">
              <div class="text-5xl leading-none" aria-hidden="true">{{ vm().country!.emoji }}</div>
              <div>
                <h1 class="text-2xl font-semibold tracking-tight">
                  {{ vm().country!.name }}
                </h1>
                <div class="mt-1 text-sm text-[var(--app-muted)]">
                  {{ vm().country!.code }} · {{ vm().country!.continent.name }}
                </div>
              </div>
            </div>
          </header>

          <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-[var(--app-muted)]">Native name</dt>
              <dd class="mt-1 text-sm font-medium">{{ vm().country!.native }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-[var(--app-muted)]">Capital</dt>
              <dd class="mt-1 text-sm font-medium">{{ vm().country!.capital ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-[var(--app-muted)]">Currencies</dt>
              <dd class="mt-1 text-sm font-medium">
                @if (vm().country!.currencies.length) {
                  {{ vm().country!.currencies.join(', ') }}
                } @else {
                  {{ vm().country!.currency ?? '—' }}
                }
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-[var(--app-muted)]">Calling code</dt>
              <dd class="mt-1 text-sm font-medium">
                @if (vm().country!.phones.length) {
                  +{{ vm().country!.phones.join(', +') }}
                } @else if (vm().country!.phone) {
                  +{{ vm().country!.phone }}
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-[var(--app-muted)]">AWS region</dt>
              <dd class="mt-1 text-sm font-medium">{{ vm().country!.awsRegion || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-[var(--app-muted)]">Languages</dt>
              <dd class="mt-1 flex flex-wrap gap-2">
                @for (l of languages(); track l.code) {
                  <span
                    class="inline-flex items-center rounded-full bg-[var(--app-bg)] px-2.5 py-1 text-xs font-medium text-[var(--app-muted)] ring-1 ring-[var(--app-border)]"
                  >
                    {{ l.name }}
                    <span class="ml-1 opacity-70">({{ l.code }})</span>
                  </span>
                } @empty {
                  <span class="text-sm text-[var(--app-muted)]">—</span>
                }
              </dd>
            </div>
          </dl>

          <div class="mt-6 grid gap-4 lg:grid-cols-2">
            <div class="space-y-3">
              @if (coordsVm().loading) {
                <div
                  class="animate-pulse overflow-hidden rounded-2xl bg-[var(--app-card)] shadow-sm ring-1 ring-[var(--app-border)]"
                >
                  <div class="h-12 border-b border-[var(--app-border)]"></div>
                  <div class="h-80 bg-[var(--app-bg)]"></div>
                </div>
              } @else if (coordsVm().coords) {
                <app-leaflet-map
                  [title]="'Map of ' + vm().country!.name"
                  [lat]="coordsVm().coords!.lat"
                  [lon]="coordsVm().coords!.lon"
                  [zoom]="5"
                />
              } @else {
                <div
                  class="rounded-2xl bg-[var(--app-card)] p-4 text-sm shadow-sm ring-1 ring-[var(--app-border)]"
                >
                  <div class="font-semibold">Map</div>
                  <div class="mt-1 text-[var(--app-muted)]">
                    Coordinates are unavailable for this country.
                  </div>
                </div>
              }
              @if (coordsVm().error) {
                <div class="text-sm text-[var(--app-muted)]">
                  Map data error: {{ coordsVm().error }}
                </div>
              }
            </div>

            <div class="space-y-3">
              <div
                class="flex min-h-[22.5rem] flex-col rounded-2xl bg-[var(--app-card)] p-4 shadow-sm ring-1 ring-[var(--app-border)]"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm font-semibold tracking-tight">Weather (current)</div>
                  <a
                    class="text-sm text-[var(--app-muted)] underline underline-offset-4 hover:opacity-80"
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noopener"
                  >
                    Source
                  </a>
                </div>

                <div class="mt-4 flex-1">
                  @if (weatherVm().loading) {
                    <div class="animate-pulse space-y-2">
                      <div class="h-4 w-40 rounded bg-[var(--app-bg)]"></div>
                      <div class="h-4 w-56 rounded bg-[var(--app-bg)]"></div>
                    </div>
                  } @else if (weatherVm().current) {
                    <dl class="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <dt class="text-xs text-[var(--app-muted)]">Temperature</dt>
                        <dd class="mt-1 font-semibold">
                          {{ weatherVm().current!.temperatureC.toFixed(1) }}°C
                        </dd>
                      </div>
                      <div>
                        <dt class="text-xs text-[var(--app-muted)]">Wind</dt>
                        <dd class="mt-1 font-semibold">
                          {{ weatherVm().current!.windSpeedKmh.toFixed(0) }} km/h ·
                          {{ weatherVm().current!.windDirectionDeg.toFixed(0) }}°
                        </dd>
                      </div>
                      <div class="sm:col-span-2">
                        <dt class="text-xs text-[var(--app-muted)]">Time</dt>
                        <dd class="mt-1 font-medium">{{ weatherVm().current!.time }}</dd>
                      </div>
                    </dl>
                  } @else {
                    <div class="text-sm text-[var(--app-muted)]">
                      Weather is unavailable (missing coordinates or provider didn’t return data).
                    </div>
                  }
                </div>
              </div>

              @if (weatherVm().error) {
                <div class="text-sm text-[var(--app-muted)]">
                  Weather data error: {{ weatherVm().error }}
                </div>
              }
            </div>
          </div>

          @if (states().length) {
            <div class="mt-6 border-t border-[var(--app-border)] pt-5">
              <div class="text-sm font-semibold tracking-tight">States</div>
              <div class="mt-3 flex flex-wrap gap-2">
                @for (s of states(); track s.code ?? s.name) {
                  <span
                    class="inline-flex items-center rounded-full bg-[var(--app-bg)] px-2.5 py-1 text-xs font-medium text-[var(--app-muted)] ring-1 ring-[var(--app-border)]"
                  >
                    {{ s.name }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div
          class="rounded-2xl bg-[var(--app-card)] p-6 text-sm shadow-sm ring-1 ring-[var(--app-border)]"
        >
          <div class="font-semibold">Country not found</div>
          <div class="mt-1 text-[var(--app-muted)]">
            That code doesn’t match a country in the API.
          </div>
        </div>
      }
    </section>
  `,
})
export class CountryDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly repo = inject(CountriesRepository);
  private readonly insights = inject(CountryInsightsService);

  private readonly code$ = requiredUpperParam$(this.route.paramMap, 'code').pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly vm = toSignal(
    this.code$.pipe(switchMap((code) => this.repo.watchCountry(code))),
    { initialValue: { loading: true, errors: null, country: null } satisfies CountryVm },
  );

  readonly coordsVm = toSignal(
    this.code$.pipe(switchMap((code) => this.insights.getCoordinatesByCountryCode(code))),
    { initialValue: { loading: true, error: null, coords: null } },
  );

  readonly weatherVm = toSignal(
    toObservable(this.coordsVm).pipe(switchMap((c) => this.insights.getCurrentWeather(c.coords))),
    { initialValue: { loading: true, error: null, current: null } },
  );

  readonly languages = computed(() => {
    const country = this.vm().country;
    return (country?.languages ?? []).filter(Boolean);
  });

  readonly states = computed(() => {
    const country = this.vm().country;
    return (country?.states ?? []).filter(Boolean);
  });

  readonly skeleton = computed(() => Array.from({ length: 6 }, (_, i) => i));
}
