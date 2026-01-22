import { RouterLink } from '@angular/router';
import { Component, input } from '@angular/core';
import type { CountryCardModel } from './country-card.types';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-country-card',
  styleUrl: './country-card.component.scss',
  templateUrl: './country-card.component.html',
})
export class CountryCardComponent {
  readonly country = input.required<CountryCardModel>();
}
