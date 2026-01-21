import type {
  CountryVm,
  CountriesVm,
  ContinentsVm,
  GqlErrorLike,
  CountryDetails,
  CountryListItem,
  ContinentListItem,
} from './countries.types';
import {
  CountryGQL,
  CountriesGQL,
  ContinentsGQL,
  type CountryFilterInput,
  type StringQueryOperatorInput,
} from '../../graphql/generated';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { escapeRegexLiteral } from '../utils/strings';
import { getString, isRecord, type UnknownRecord } from '../utils/guards';

function isContinentListItem(value: unknown): value is ContinentListItem {
  if (!isRecord(value)) return false;
  return getString(value, 'code') !== null && getString(value, 'name') !== null;
}

function isCountryListItem(value: unknown): value is CountryListItem {
  if (!isRecord(value)) return false;

  return hasCountryListShape(value);
}

function hasCountryListShape(value: UnknownRecord): boolean {
  const continent = value['continent'];
  if (!isRecord(continent)) return false;

  return (
    getString(value, 'code') !== null &&
    getString(value, 'name') !== null &&
    getString(value, 'native') !== null &&
    getString(value, 'emoji') !== null &&
    getString(continent, 'code') !== null &&
    getString(continent, 'name') !== null
  );
}

function isCountryDetails(value: unknown): value is CountryDetails {
  if (!isRecord(value)) return false;
  if (!hasCountryListShape(value)) return false;
  return Array.isArray(value['languages']) && Array.isArray(value['states']);
}

function extractErrors(result: { error?: unknown }): readonly GqlErrorLike[] | null {
  const err = result.error;
  if (!err) return null;

  const out: GqlErrorLike[] = [];

  if (isRecord(err)) {
    const graphQLErrors = err['graphQLErrors'];
    if (Array.isArray(graphQLErrors)) {
      for (const e of graphQLErrors) {
        if (isRecord(e)) {
          const msg = getString(e, 'message');
          if (msg) out.push({ message: msg });
        }
      }
    }

    const networkError = err['networkError'];
    if (isRecord(networkError)) {
      const networkMsg = getString(networkError, 'message');
      if (networkMsg) out.push({ message: networkMsg });
    }

    const msg = getString(err, 'message');
    if (msg) out.push({ message: msg });
  } else if (err instanceof Error) {
    out.push({ message: err.message });
  }

  return out.length ? out : [{ message: 'Unknown GraphQL error' }];
}

function buildStringQuery(input: string): StringQueryOperatorInput {
  const trimmed = input.trim();
  if (!trimmed) return {};

  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return { eq: upper };

  const safe = escapeRegexLiteral(trimmed);
  return { regex: `.*${safe}.*` };
}

@Injectable({ providedIn: 'root' })
export class CountriesRepository {
  constructor(
    private readonly continentsGql: ContinentsGQL,
    private readonly countriesGql: CountriesGQL,
    private readonly countryGql: CountryGQL,
  ) {}

  watchContinents(): Observable<ContinentsVm> {
    const ref = this.continentsGql.watch({ variables: {} });
    return ref.valueChanges.pipe(
      map((result) => ({
        loading: result.loading,
        errors: extractErrors(result),
        continents: (result.data?.continents ?? []).filter(isContinentListItem),
      })),
    );
  }

  watchCountries(params?: { search?: string; continentCode?: string }): Observable<CountriesVm> {
    const filter: CountryFilterInput = {};

    const continentCode = params?.continentCode?.trim();
    if (continentCode) filter.continent = { eq: continentCode };

    const search = params?.search?.trim();
    if (search) {
      const q = buildStringQuery(search);
      if (q.eq) filter.code = q;
      else if (q.regex) filter.name = q;
    }

    const ref = this.countriesGql.watch({
      variables: { filter: Object.keys(filter).length ? filter : null },
    });

    return ref.valueChanges.pipe(
      map((result) => ({
        loading: result.loading,
        errors: extractErrors(result),
        countries: (result.data?.countries ?? []).filter(isCountryListItem),
      })),
    );
  }

  watchCountry(code: string): Observable<CountryVm> {
    const ref = this.countryGql.watch({ variables: { code } });

    return ref.valueChanges.pipe(
      map((result) => ({
        loading: result.loading,
        errors: extractErrors(result),
        country: isCountryDetails(result.data?.country) ? result.data!.country : null,
      })),
    );
  }
}
