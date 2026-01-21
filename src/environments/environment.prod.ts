export const environment = {
  production: true,
  api: {
    countriesGraphql: 'https://countries.trevorblades.com/graphql',
    restCountries: 'https://restcountries.com/v3.1',
    openMeteo: 'https://api.open-meteo.com/v1',
  },
  map: {
    osmTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
} as const;

