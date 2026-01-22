export type WeatherIcon = 'sun' | 'cloud-sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

export function toCompassDirection(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  const dirs = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ] as const;

  const idx = Math.round(d / 22.5) % 16;

  return dirs[idx];
}

const WEATHER_MAPPINGS: {
  codes: number[];
  label: string;
  icon: WeatherIcon | ((isDay: boolean) => WeatherIcon);
}[] = [
  { codes: [45, 48], label: 'Fog', icon: 'fog' },
  { codes: [3], label: 'Overcast', icon: 'cloud' },
  { codes: [2], label: 'Partly cloudy', icon: 'cloud-sun' },
  { codes: [95, 96, 99], label: 'Thunderstorm', icon: 'storm' },
  { codes: [51, 53, 55, 56, 57], label: 'Drizzle', icon: 'rain' },
  { codes: [71, 73, 75, 77, 85, 86], label: 'Snow', icon: 'snow' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], label: 'Rain', icon: 'rain' },
  { codes: [0], label: 'Clear', icon: (isDay: boolean) => (isDay ? 'sun' : 'cloud') },
  { codes: [1], label: 'Mainly clear', icon: (isDay: boolean) => (isDay ? 'cloud-sun' : 'cloud') },
];

export function weatherCodeToLabelAndIcon(
  code: number,
  isDay: boolean,
): { label: string; icon: WeatherIcon } {
  for (const mapping of WEATHER_MAPPINGS) {
    if (mapping.codes.includes(code)) {
      const icon = typeof mapping.icon === 'function' ? mapping.icon(isDay) : mapping.icon;
      return { label: mapping.label, icon };
    }
  }
  return { label: `Code ${code}`, icon: 'cloud' };
}
