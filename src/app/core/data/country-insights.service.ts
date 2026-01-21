import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import type { Coordinates, CoordinatesVm, WeatherVm } from './country-insights.types';

type RestCountriesResponseItem = {
  latlng?: [number, number] | number[];
};

type OpenMeteoResponse = {
  current_weather?: {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
  };
};

@Injectable({ providedIn: 'root' })
export class CountryInsightsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly coordsCache = new Map<string, Observable<CoordinatesVm>>();
  private readonly weatherCache = new Map<string, Observable<WeatherVm>>();

  getCoordinatesByCountryCode(alpha2: string): Observable<CoordinatesVm> {
    const code = (alpha2 ?? '').trim().toUpperCase();
    if (!code) return of({ loading: false, error: 'Missing country code', coords: null });

    if (!isPlatformBrowser(this.platformId)) {
      return of({ loading: false, error: null, coords: null });
    }

    const cached = this.coordsCache.get(code);
    if (cached) return cached;

    const url =
      `${environment.api.restCountries}/alpha/${encodeURIComponent(code)}` + `?fields=latlng`;
    const req$ = this.http.get<RestCountriesResponseItem[] | RestCountriesResponseItem>(url).pipe(
      map((res) => {
        const item = Array.isArray(res) ? res[0] : res;
        const latlng = item?.latlng;
        const lat = Array.isArray(latlng) ? latlng[0] : undefined;
        const lon = Array.isArray(latlng) ? latlng[1] : undefined;

        if (typeof lat !== 'number' || typeof lon !== 'number') {
          return { loading: false, error: null, coords: null } satisfies CoordinatesVm;
        }

        return { loading: false, error: null, coords: { lat, lon } } satisfies CoordinatesVm;
      }),
      startWith({ loading: true, error: null, coords: null } satisfies CoordinatesVm),
      catchError((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load coordinates';
        return of({ loading: false, error: msg, coords: null } satisfies CoordinatesVm);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.coordsCache.set(code, req$);
    return req$;
  }

  getCurrentWeather(coords: Coordinates | null): Observable<WeatherVm> {
    if (!coords) return of({ loading: false, error: null, current: null });

    if (!isPlatformBrowser(this.platformId)) {
      return of({ loading: false, error: null, current: null });
    }

    const key = `${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`;
    const cached = this.weatherCache.get(key);
    if (cached) return cached;

    const url =
      `${environment.api.openMeteo}/forecast` +
      `?latitude=${encodeURIComponent(coords.lat)}` +
      `&longitude=${encodeURIComponent(coords.lon)}` +
      `&current_weather=true` +
      `&timezone=auto`;

    const req$ = this.http.get<OpenMeteoResponse>(url).pipe(
      map((res) => {
        const cw = res?.current_weather;
        if (!cw) return { loading: false, error: null, current: null } satisfies WeatherVm;

        return {
          loading: false,
          error: null,
          current: {
            time: cw.time,
            temperatureC: cw.temperature,
            windSpeedKmh: cw.windspeed,
            windDirectionDeg: cw.winddirection,
            weatherCode: cw.weathercode,
          },
        } satisfies WeatherVm;
      }),
      startWith({ loading: true, error: null, current: null } satisfies WeatherVm),
      catchError((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to load weather';
        return of({ loading: false, error: msg, current: null } satisfies WeatherVm);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.weatherCache.set(key, req$);
    return req$;
  }
}
