import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { shareReplay, switchMap } from 'rxjs/operators';
import { ButtonComponent } from '../../ui/button/button.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LeafletMapComponent } from '../../ui/leaflet-map/leaflet-map.component';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CountriesRepository, CountryInsightsService, type CountryVm } from '../../core/data';
import {
  requiredUpperParam$,
  toCompassDirection,
  weatherCodeToLabelAndIcon,
} from '../../core/utils';

@Component({
  standalone: true,
  styleUrl: './country-detail.page.scss',
  templateUrl: './country-detail.page.html',
  imports: [LeafletMapComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly repo = inject(CountriesRepository);
  private readonly insights = inject(CountryInsightsService);

  private readonly code$ = requiredUpperParam$(this.route.paramMap, 'code').pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly vm = toSignal(this.code$.pipe(switchMap((code) => this.repo.watchCountry(code))), {
    initialValue: { loading: true, errors: null, country: null } satisfies CountryVm,
  });

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

  readonly windMeta = computed(() => {
    const cur = this.weatherVm().current;
    const deg = Math.round(cur?.windDirectionDeg ?? 0);
    return {
      deg,
      compass: toCompassDirection(deg),
      rotate: `rotate(${deg}deg)`,
    };
  });

  readonly weatherBadge = computed(() => {
    const cur = this.weatherVm().current;
    if (!cur) return null;
    const { label, icon } = weatherCodeToLabelAndIcon(cur.weatherCode, cur.isDay);
    return { label, icon, dayLabel: cur.isDay ? 'Day' : 'Night' } as const;
  });

  readonly weatherTimeLabel = computed(() => {
    const time = this.weatherVm().current?.time;
    if (!time) return '—';
    const m = moment(time);
    return m.isValid() ? m.format('ddd, MMM D, YYYY • HH:mm') : time;
  });
}
