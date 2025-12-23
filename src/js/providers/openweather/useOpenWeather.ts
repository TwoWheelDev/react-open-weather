import { useEffect, useReducer, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { getIcon, WeatherCode } from './iconsMap';
import { LanguageCode } from '../../lang';
import { CurrentData } from '../../components/Today';
import { ForecastData } from '../../components/Forecast';
import { WeatherData } from '../../components/ReactWeather';
import { SUCCESS, FAILURE, fetchReducer } from '../provider_utils';

interface useOpenWeatherOptions {
  key?: string
  lat: string|number
  lon: string|number
  lang: LanguageCode
  unit?: string
}

interface OpenWeatherDaily {
  dt: number
  sunrise: number
  sunset: number
  temp: {
    day: number
    min: number
    max: number
    night: number
    eve: number
    morn: number
  }
  feels_like: { day: number, night: number, eve: number, morn: number }
  pressure: number
  humidity: number
  dew_point: number
  wind_speed: number
  wind_deg: number
  weather: [
    { id: number, main: string, description: string, icon: WeatherCode },
  ]
  clouds: number
  pop: number
  uvi: number
}

interface OpenWeatherCurrent {
  dt: number
  sunrise: number
  sunset: number
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  wind_speed: number
  wind_deg: number
  weather: [
    { id: number, main: string, description: string, icon: WeatherCode },
  ]
  clouds: number
  uvi: number
  visibility: number
}

export const formatDate = (dte: number, lang: LanguageCode) => {
  if (lang && lang !== 'en') {
    dayjs.locale(lang.replace('_', '-'));
  }
  if (dte && dayjs(dte).isValid()) {
    return dayjs.unix(dte).format('ddd D MMMM');
  }
  return '';
};

export const mapCurrent = (day: OpenWeatherCurrent, lang: LanguageCode): CurrentData => {
  return {
    date: formatDate(day.dt, lang),
    description: day.weather[0] ? day.weather[0].description : '',
    icon: day.weather[0] && getIcon(day.weather[0].icon),
    temperature: {
      current: day.temp.toFixed(0),
      min: undefined, // openweather doesnt provide min/max on current weather
      max: undefined,
    },
    wind: day.wind_speed.toFixed(0),
    humidity: day.humidity,
  };
};

export const mapForecast = (forecast: OpenWeatherDaily[], lang: LanguageCode): ForecastData[] => {
  const mappedForecast = [];

  for (let i = 0; i < 5; i += 1) {
    mappedForecast.push({
      date: formatDate(forecast[i].dt, lang),
      description: forecast[i].weather[0]
        ? forecast[i].weather[0].description
        : '',
      icon: forecast[i].weather[0] && getIcon(forecast[i].weather[0].icon),
      temperature: {
        min: forecast[i].temp.min.toFixed(0),
        max: forecast[i].temp.max.toFixed(0),
      },
      wind: forecast[i].wind_speed.toFixed(0),
      humidity: forecast[i].humidity,
    });
  }
  return mappedForecast;
};

export const mapData = (forecastData: OpenWeatherDaily[], todayData: OpenWeatherCurrent, lang: LanguageCode) => {
  if (forecastData && todayData) {
    const mapped: WeatherData = {
          current: mapCurrent(todayData, lang),
          forecast: mapForecast(forecastData, lang)
        }
    
    return mapped;
  }
  throw new Error("No weather data supplied");
};

const initialState = {
  data: null,
  errorMessage: null,
};

const useOpenWeather = (options: useOpenWeatherOptions) => {
  const endpoint = '//api.openweathermap.org/data/3.0/onecall';
  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const { data, errorMessage } = state;
  const [isLoading, setIsLoading] = useState(false);
  const { unit, lang, key, lon, lat } = options;
  const params = {
    appid: key,
    lang,
    units: unit,
    lat,
    lon,
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const forecastResponse = await axios.get(endpoint, { params });
      const payload = mapData(
        forecastResponse.data.daily,
        forecastResponse.data.current,
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

export default useOpenWeather;
