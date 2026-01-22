export type CountryCardModel = {
  code: string;
  name: string;
  emoji: string;
  capital?: string | null;
  currency?: string | null;
  continent?: { name: string } | null;
};
