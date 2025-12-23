import { useEffect, useReducer, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { getIcon, WeatherCode } from './iconsMap';
import { SUCCESS, FAILURE, fetchReducer } from '../provider_utils';
import { LanguageCode } from '../../lang';
import { WeatherData } from '../../components/ReactWeather';
import { CurrentData } from '../../components/Today';
import { ForecastData } from '../../components/Forecast';

interface useWeatherBitOptions {
  key?: string
  lat: string | number
  lon: string | number
  lang: LanguageCode
  unit?: string
}

interface WeatherBitCurrent {
  rh: number,
  city_name: string,
  wind_spd: number,
  weather: { icon: string, code: WeatherCode, description: string },
  datetime: string,
  temp: number
}

interface WeatherBitForecast {
  rh: number,
  wind_spd: number,
  weather: { icon: string, code: WeatherCode, description: string },
  max_temp: number,
  datetime: string,
  min_temp: number,
}

const initialState = {
  data: null,
  errorMessage: null,
};

export const formatDate = (dte: string, lang: LanguageCode) => {
  if (lang && lang !== 'en') {
    dayjs.locale(lang.replace('_', '-'));
  }
  if (dte && dayjs(dte).isValid()) {
    return dayjs(dte).format('ddd D MMMM');
  }
  return '';
};

export const mapCurrent = (day: WeatherBitForecast, current: WeatherBitCurrent, lang: LanguageCode): CurrentData => {
  return {
    date: formatDate(day.datetime, lang),
    description: current.weather ? current.weather.description : '',
    icon: current.weather && getIcon(current.weather.code),
    temperature: {
      current: current.temp.toFixed(0),
      min: day.min_temp.toFixed(0),
      max: day.max_temp.toFixed(0),
    },
    wind: current.wind_spd.toFixed(0),
    humidity: current.rh,
  };
};

export const mapForecast = (forecast: WeatherBitForecast[], lang: LanguageCode): ForecastData[] => {
  const mappedForecast = [];
  for (let i = 0; i < 5; i += 1) {
    mappedForecast.push({
      date: formatDate(forecast[i].datetime, lang),
      description: forecast[i].weather ? forecast[i].weather.description : '',
      icon: forecast[i].weather && getIcon(forecast[i].weather.code),
      temperature: {
        min: forecast[i].min_temp.toFixed(0),
        max: forecast[i].max_temp.toFixed(0),
      },
      wind: forecast[i].wind_spd.toFixed(0),
      humidity: forecast[i].rh,
    });
  }
  return mappedForecast;
};

export const mapData = (daysData: WeatherBitForecast[], current: WeatherBitCurrent, lang: LanguageCode): WeatherData => {
  if (daysData && current) {
    const mapped: WeatherData = {
      current: mapCurrent(daysData[0], current, lang),
      forecast: mapForecast(daysData, lang)
    }

    return mapped;
  }
  throw new Error("No weather data supplied");
};

const useWeatherBit = (options: useWeatherBitOptions) => {
  const baseApiUrl = 'https://api.weatherbit.io/v2.0';
  const endpointForecast = `${baseApiUrl}/forecast/daily`;
  const endPointToday = `${baseApiUrl}/current`;
  const [isLoading, setIsLoading] = useState(false);
  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const { data, errorMessage } = state;
  const { unit, lang, key, lon, lat } = options;
  const params = {
    key,
    days: 5,
    lang,
    units: unit,
    lon,
    lat,
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [forecastResponse, todayResponse] = await axios.all([
        axios.get(endpointForecast, { params }),
        axios.get(endPointToday, { params }),
      ]);
      const payload = mapData(
        forecastResponse.data.data,
        todayResponse.data.data[0],
        lang,
      );
      dispatch({
        type: SUCCESS,
        payload,
      });
    } catch (error: unknown) {

      let message: string;

      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error); // fallback to string representation
      }

      dispatch({ type: FAILURE, payload: message });
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [lon, lat]);
  return { data, isLoading, errorMessage, fetchData };
};

export default useWeatherBit;
