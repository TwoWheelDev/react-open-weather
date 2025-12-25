/* eslint-disable import/no-extraneous-dependencies */
import MockAdapter from 'axios-mock-adapter';
import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import useOpenWeather, {
  formatDate,
  mapCurrent,
  mapForecast,
  mapData,
} from '../src/js/providers/openweather/useOpenWeather';
import {
  mappedCurrent,
  apiCurrentResponse,
} from './fixtures/openweather/current';
import {
  mappedForecast,
  apiForecastResponse,
} from './fixtures/openweather/forecast';
import { getIcon } from '../src/js/providers/openweather/iconsMap';
import svgIcons from '../src/js/svgIcons';

describe('Testing data mapping', () => {
  test('should return formatted date', () => {
    expect(formatDate(1573516800, 'en')).toEqual('Tue 12 November');
  });

  test('return empty string if input date is invalid', () => {
    expect(formatDate(null, 'en')).toEqual('');
  });

  test('should map today data', () => {
    const mapped = mapCurrent(apiCurrentResponse, 'en');
    expect(mapped).toEqual(mappedCurrent);
  });

  test('should map forecast data', () => {
    const mapped = mapForecast(apiForecastResponse, 'en');
    expect(mapped).toEqual(mappedForecast);
  });

  test('should map combined current and forecast data', () => {
    const mapped = mapData(apiForecastResponse, apiCurrentResponse, 'en');
    const expected = {
      current: mappedCurrent,
      forecast: mappedForecast,
    };
    expect(mapped).toEqual(expected);
  });
});

describe('Test useOpenWeather hook', () => {
  test('gets and map the data', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet().reply(() => {
      const response = {
        current: apiCurrentResponse,
        daily: apiForecastResponse,
      };
      return [200, response];
    });

    const { result } = renderHook(() =>
      useOpenWeather({
        key: 'dummy key',
        lat: '48.137154',
        lon: '11.576124',
        lang: 'en',
        unit: 'metric',
      }),
    );

    act(() => {
      result.current.fetchData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const expected = {
      current: mappedCurrent,
      forecast: mappedForecast,
    };

    expect(result.current.data).toEqual(expected);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.errorMessage).toEqual(null);
  });

  test('return error when http request fails', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet().reply(500);
    const { result } = renderHook(() =>
      useOpenWeather({
        key: 'dummy key',
        lat: '48.137154',
        lon: '11.576124',
        lang: 'en',
        unit: 'metric',
      }),
    );

    act(() => {
      result.current.fetchData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(null);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.errorMessage).toEqual(
      'Request failed with status code 500',
    );
  });
});

describe('Test Icons Map', () => {
  test('should return the correct icon', () => {
    const icon = getIcon('04d');
    expect(icon).toEqual(svgIcons.cloudy);
  });
  test('should return default icon when icon is not found', () => {
    const icon = getIcon('unknown');
    expect(icon).toEqual(svgIcons.sunny);
  });
});
