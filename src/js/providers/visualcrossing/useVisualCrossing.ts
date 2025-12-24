import { useEffect, useReducer, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import axios from 'axios';
import { getIcon, WeatherCode } from './iconsMap';
import { LanguageCode } from '../../lang';
import { SUCCESS, FAILURE, fetchReducer } from '../provider_utils';
import { WeatherData } from '../../components/ReactWeather';
import { ForecastData } from '../../components/Forecast';
import { CurrentData } from '../../components/Today';

interface useVisualCrossingOptions {
  key?: string;
  lat: string | number;
  lon: string | number;
  lang: LanguageCode;
  unit?: string;
}

interface VisualCrossingDays {
  datetimeEpoch: number;
  tempmax: number;
  tempmin: number;
  temp: number;
  humidity: number;
  windspeed: number;
  description: string;
  icon: WeatherCode;
}

interface VisualCrossingCurrent {
  datetimeEpoch: number;
  temp: number;
  humidity: number;
  windspeed: number;
  icon: WeatherCode;
}

interface VisualCrossingResponse {
  queryCost: number;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  address: string;
  timezone: string;
  tzoffset: number;
  days: VisualCrossingDays[];
  currentConditions: VisualCrossingCurrent;
}

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (dte: number, lang: LanguageCode, tz: string) => {
  if (lang && lang !== 'en') {
    dayjs.locale(lang.replace('_', '-'));
  }
  if (dte && dayjs(dte).isValid()) {
    let date = dayjs.unix(dte);
    // without the timezone shift, the output time may be at the whim of the local JavaScript engine timezone
    if (tz) date = date.tz(tz);
    return date.format('ddd D MMMM');
  }
  return '';
};

export const mapCurrent = (
  day: VisualCrossingDays,
  current: VisualCrossingCurrent,
  lang: LanguageCode,
  tz: string,
): CurrentData => {
  return {
    date: formatDate(day.datetimeEpoch, lang, tz),
    description: day ? day.description : '',
    icon: current && getIcon(current.icon),
    temperature: {
      current: current.temp.toFixed(0),
      min: day.tempmin.toFixed(0),
      max: day.tempmax.toFixed(0),
    },
    wind: current.windspeed.toFixed(0),
    humidity: current.humidity,
  };
};

export const mapForecast = (
  days: VisualCrossingDays[],
  lang: LanguageCode,
  tz: string,
): ForecastData[] => {
  const mappedForecast = [];

  for (let i = 0; i < 5; i += 1) {
    mappedForecast.push({
      date: formatDate(days[i].datetimeEpoch, lang, tz),
      description: days[i].description,
      icon: getIcon(days[i].icon),
      temperature: {
        min: days[i].tempmin.toFixed(0),
        max: days[i].tempmax.toFixed(0),
      },
      wind: days[i].windspeed.toFixed(0),
      humidity: days[i].humidity,
    });
  }
  return mappedForecast;
};

export const mapData = (
  weatherData: VisualCrossingResponse,
  lang: LanguageCode,
): WeatherData => {
  if (weatherData) {
    const tz = weatherData.timezone;
    const { days } = weatherData;
    const current = weatherData.currentConditions;
    const today = days && days[0]; // assuming forecast response

    const mapped: WeatherData = {
      current: mapCurrent(today, current, lang, tz),
      forecast: mapForecast(days, lang, tz),
    };

    return mapped;
  }
  throw new Error('No weather data supplied');
};

const initialState = {
  data: null,
  errorMessage: null,
};

const useVisualCrossing = (options: useVisualCrossingOptions) => {
  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const { data, errorMessage } = state;
  const [isLoading, setIsLoading] = useState(false);
  const { unit, lang, key, lon, lat } = options;
  // end point supports addresses too but stay with lat,lon
  const endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}`;
  const params = {
    key,
    lang,
    unitGroup: unit, // metric, us
    iconSet: 'icons2', // use updated icons
    include: 'days,current', // reduce response data to data we need
    elements:
      'datetimeEpoch,tempmax,tempmin,temp,humidity,windspeed,icon,description', // reduce response data size to data we need
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const weatherResponse = await axios.get(endpoint, { params });
      const payload = mapData(weatherResponse.data, lang);

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

export default useVisualCrossing;
