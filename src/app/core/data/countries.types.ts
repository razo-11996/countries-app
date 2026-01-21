import type { ContinentsQuery, CountriesQuery, CountryQuery } from '../../graphql/generated';

export type GqlErrorLike = { message: string };

export type ContinentListItem = ContinentsQuery['continents'][number];
export type CountryListItem = CountriesQuery['countries'][number];
export type CountryDetails = NonNullable<CountryQuery['country']>;

export type ContinentsVm = {
  loading: boolean;
  errors: readonly GqlErrorLike[] | null;
  continents: ContinentListItem[];
};

export type CountriesVm = {
  loading: boolean;
  errors: readonly GqlErrorLike[] | null;
  countries: CountryListItem[];
};

export type CountryVm = {
  loading: boolean;
  errors: readonly GqlErrorLike[] | null;
  country: CountryDetails | null;
};

