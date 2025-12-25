/* eslint-disable import/no-extraneous-dependencies */
import MockAdapter from 'axios-mock-adapter';
import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import useOpenMeteo, {
  formatDate,
  mapCurrent,
  mapForecast,
  mapData,
} from '../src/js/providers/open-meteo/useOpenMeteo';
import { mappedCurrent } from './fixtures/openmeteo/current';
import {
  mappedForecast,
  apiForecastResponse,
} from './fixtures/openmeteo/forecast';
import {
  getIcon,
  getWeatherDescription,
} from '../src/js/providers/open-meteo/weatherDescriptionMap';
import svgIcons from '../src/js/svgIcons';

describe('Testing data mapping', () => {
  test('should return formatted date', () => {
    expect(formatDate(1573516800, 'en', 'Europe/Berlin')).toEqual(
      'Tue 12 November',
    ); // depends on timezone of Javascript runtime. time epoch is relative to UTC
  });

  test('return empty string if input date is invalid', () => {
    expect(formatDate(null, 'en')).toEqual('');
  });

  test('should map today data', () => {
    const mapped = mapCurrent(
      {
        temp_max: apiForecastResponse.daily.temperature_2m_max[0],
        temp_min: apiForecastResponse.daily.temperature_2m_min[0],
      },
      apiForecastResponse.current,
      'en',
    );
    expect(mapped).toEqual(mappedCurrent);
  });

  test('should map forecast data', () => {
    const mapped = mapForecast(apiForecastResponse.daily, 'en');
    expect(mapped).toEqual(mappedForecast);
  });

  test('should map combined current and forecast data', () => {
    const mapped = mapData(apiForecastResponse, 'en');
    const expected = {
      current: mappedCurrent,
      forecast: mappedForecast,
    };
    expect(mapped).toEqual(expected);
  });
});

describe('Test useOpenMeteo hook', () => {
  test('gets and maps the data', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet().reply(200, apiForecastResponse);

    const { result } = renderHook(() =>
      useOpenMeteo({
        key: '1PYNQ6AWUDJE9AFERDCHJHSXK',
        lat: '48.137154',
        lon: '11.576124',
        lang: 'en',
        unit: { temperature: 'fahrenheit', wind_speed: 'mph' },
      }),
    );

    act(() => {
      result.current.fetchData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({
      current: mappedCurrent,
      forecast: mappedForecast,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  test('returns error when http request fails', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet().reply(500);

    const { result } = renderHook(() =>
      useOpenMeteo({
        lat: '48.137154',
        lon: '11.576124',
        lang: 'en',
      }),
    );

    act(() => {
      result.current.fetchData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toEqual(
      'Request failed with status code 500',
    );
  });
});

describe('Test Icons & Description Map', () => {
  test('should return the correct icon', () => {
    const icon = getIcon(3);
    expect(icon).toEqual(svgIcons.cloudy);
  });

  test('should return default icon when icon is not found', () => {
    const icon = getIcon(999);
    expect(icon).toEqual(svgIcons.sunny);
  });

  test('should return the correct description', () => {
    const desc = getWeatherDescription(3);
    expect(desc).toEqual('Overcast');
  });

  test('should return empty string when code is not found', () => {
    const desc = getWeatherDescription(999);
    expect(desc).toEqual('');
  });
});
