import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Countries',
    loadComponent: () => import('./pages/countries/countries.page').then((m) => m.CountriesPage),
  },
  {
    path: 'country/:code',
    title: 'Country details',
    loadComponent: () =>
      import('./pages/country-detail/country-detail.page').then((m) => m.CountryDetailPage),
  },
  {
    path: '**',
    title: 'Not found',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
