import { useEffect, useReducer, useState } from 'react';
import dayjs from 'dayjs';
import utc  from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import axios from 'axios';
import { getWeatherDescription, getIcon, WeatherCode } from './weatherDescriptionMap';
import { CurrentData } from '../../components/Today';
import { ForecastData } from '../../components/Forecast';
import { LanguageCode } from '../../lang';
import { WeatherData } from '../../components/ReactWeather';
import { SUCCESS, FAILURE, fetchReducer } from '../provider_utils';

dayjs.extend(utc)
dayjs.extend(timezone)

interface useOpenMeteoOptions {
  key?: string
  prefix?: string
  lat: string|number
  lon: string|number
  lang: LanguageCode
  unit?: { temperature: 'celsius'|'fahrenheit', wind_speed: 'kmh'|'ms'|'mph'|'kn' }
}

interface OpenMeteoParams {
  latitude: string|number
  longitude: string|number
  daily: string
  current: string
  forecast_days: number
  timeformat: 'unixtime'
  temperature_unit: string
  wind_speed_unit: string
  apikey?: string
}

interface OpenMeteoDaily {
  time: Array<number>
  temperature_2m_min: Array<number>
  temperature_2m_max: Array<number>
  wind_speed_10m_max: Array<number>
  relative_humidity_2m_max: Array<number>
  weather_code: Array<WeatherCode>
}

interface OpenMeteoCurrent {
  time: number
  interval: number
  temperature_2m: number
  wind_speed_10m: number
  relative_humidity_2m: number
  weather_code: WeatherCode
}

interface OpenMeteoResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units: object
  current: OpenMeteoCurrent
  daily_units: object
  daily: OpenMeteoDaily
}

const initialState = {
  data: null,
  errorMessage: null,
};

export const formatDate = (dte: number, lang: LanguageCode, tz?: string) => {
  if (lang && lang !== 'en') {
    dayjs.locale(lang.replace('_', '-'));
  }
  if (dte && dayjs(dte).isValid()) {
    let date=dayjs.unix(dte);
    //without the timezone shift, the output time may be at the whim of the local JavaScript engine timezone 
    if (tz) date=date.tz(tz);
    return date.format('ddd D MMMM');
  }
  return '';
};

export const mapCurrent = (day: {temp_min: number, temp_max: number}, current: OpenMeteoCurrent, lang: LanguageCode): CurrentData => {
  const mappedCurrent = {
    date: formatDate(current.time, lang),
    description: getWeatherDescription(current.weather_code),
    icon: current && getIcon(current.weather_code),
    temperature: {
      current: current.temperature_2m.toFixed(0),
      min: day.temp_min.toFixed(0), 
      max: day.temp_max.toFixed(0),
    },
    wind: current.wind_speed_10m.toFixed(0),
    humidity: current.relative_humidity_2m,
  };
  return mappedCurrent
};

export const mapForecast = (days: OpenMeteoDaily, lang: LanguageCode): Array<ForecastData> => {
  const mappedForecast = [];
  
  for (let i = 0; i < 5; i += 1) {
    mappedForecast.push({
      date: formatDate(days.time[i], lang),
      description: getWeatherDescription(days.weather_code[i]),
      icon: getIcon(days.weather_code[i]),
      temperature: {
        min: days.temperature_2m_min[i].toFixed(0),
        max: days.temperature_2m_max[i].toFixed(0),
      },
      wind: days.wind_speed_10m_max[i].toFixed(0),
      humidity: days.relative_humidity_2m_max[i],
    });
  }
  return mappedForecast;
};

export const mapData = (weatherData: OpenMeteoResponse, lang: LanguageCode): WeatherData => {
  if (weatherData) {
    const days = weatherData.daily;
    const current = weatherData.current;
    const today = {
      temp_max: weatherData.daily.temperature_2m_max[0],
      temp_min: weatherData.daily.temperature_2m_min[0]
    }; 

    const mapped: WeatherData = {
      current: mapCurrent(today, current, lang),
      forecast: mapForecast(days, lang)
    }

    return mapped;
  }
  throw new Error("No weather data supplied");
};

const useOpenMeteo = (options: useOpenMeteoOptions) => {
  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const { data, errorMessage } = state;
  const [isLoading, setIsLoading] = useState(false);
  const { unit, lang, key, prefix, lon, lat } = options;
  let endpoint = 'https://api.open-meteo.com/v1/forecast';

  const temperature_unit = unit?.temperature ?? 'celsius';
  const wind_speed_unit = unit?.wind_speed ?? 'kmh';
  
  let params: OpenMeteoParams = {
    latitude: lat,
    longitude: lon,
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max,wind_speed_10m_max',
    current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code',
    forecast_days: 5,
    timeformat: 'unixtime',
    temperature_unit,
    wind_speed_unit
  };

  if (key && prefix) {
    endpoint = `https://${prefix}.open-meteo.com/v1/forecast`
    params = {
      ...params,
      apikey: key
    }
  }
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const weatherResponse = await axios.get(endpoint, { params });
      const payload = mapData(
        weatherResponse.data,
        lang,
      );

      dispatch({ type: SUCCESS, payload });
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

export default useOpenMeteo;
