import {
  inject,
  PLATFORM_ID,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { isPlatformServer } from '@angular/common';
import type { ApolloClientOptions } from '@apollo/client/core';
import { COUNTRIES_GRAPHQL_ENDPOINT } from '../config/graphql';

export function createApollo(httpLink: HttpLink, platformId: object): ApolloClientOptions {
  return {
    link: httpLink.create({ uri: COUNTRIES_GRAPHQL_ENDPOINT }),
    cache: new InMemoryCache({
      typePolicies: {
        Country: { keyFields: ['code'] },
        Continent: { keyFields: ['code'] },
        Language: { keyFields: ['code'] },
        State: { keyFields: false },
      },
    }),
    ssrMode: isPlatformServer(platformId),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  };
}

export function provideGraphQL(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const platformId = inject(PLATFORM_ID);
      return createApollo(httpLink, platformId);
    }),
  ]);
}
