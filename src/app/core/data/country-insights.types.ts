export type Coordinates = { lat: number; lon: number };

export type CoordinatesVm = {
  loading: boolean;
  error: string | null;
  coords: Coordinates | null;
};

export type WeatherVm = {
  loading: boolean;
  error: string | null;
  current: {
    time: string;
    temperatureC: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    weatherCode: number;
    isDay: boolean;
  } | null;
};
