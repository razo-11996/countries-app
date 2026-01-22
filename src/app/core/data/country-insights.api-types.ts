export type RestCountriesResponseItem = {
  latlng?: [number, number] | number[];
};

export type OpenMeteoResponse = {
  current_weather?: {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day?: number;
  };
};
