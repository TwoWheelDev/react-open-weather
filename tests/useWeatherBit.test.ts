/* eslint-disable import/no-extraneous-dependencies */
import MockAdapter from 'axios-mock-adapter';
import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useWeatherBit, {
  formatDate,
  mapCurrent,
  mapForecast,
  mapData,
} from '../src/js/providers/weatherbit/useWeatherBit';
import { apiCurrentResponse } from './fixtures/weatherbit/current';
import { apiForecastResponse } from './fixtures/weatherbit/forecast';
import { getIcon } from '../src/js/providers/weatherbit/iconsMap';

describe('Testing data mapping', () => {
  test('should return formatted date', () => {
    expect(formatDate('2019-11-22:10', 'en')).toEqual('Fri 22 November');
  });

  test('return empty string if input date is invalid', () => {
    expect(formatDate(null, 'en')).toEqual('');
  });

  test('should map today data', () => {
    const mapped = mapCurrent(
      apiForecastResponse.data[0],
      apiCurrentResponse.data[0],
      'en',
    );
    expect(mapped).toMatchSnapshot();
  });

  test('should map forecast data', () => {
    const mapped = mapForecast(apiForecastResponse.data, 'en');
    expect(mapped).toMatchSnapshot();
  });

  test('should map combined current and forecast data', () => {
    const mapped = mapData(
      apiForecastResponse.data,
      apiCurrentResponse.data[0],
      'en',
    );
    expect(mapped).toMatchSnapshot();
  });
});

describe('Test useWeatherBit hook', () => {
  test('gets and map the data', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet().reply((config) => {
      let response;
      if (config.url?.indexOf('forecast/daily') !== -1) {
        response = apiForecastResponse;
      } else {
        response = apiCurrentResponse;
      }
      return [200, response];
    });
    const { result } = renderHook(() =>
      useWeatherBit({
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

    expect(result.current.data).toMatchSnapshot();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.errorMessage).toEqual(null);
  });

  test('return erro when http request fails', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet().reply(500);
    const { result } = renderHook(() =>
      useWeatherBit({
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
    const icon = getIcon(511);
    expect(icon).toMatchSnapshot();
  });
  test('should return default icon when icon is not found', () => {
    const icon = getIcon(999);
    expect(icon).toMatchSnapshot();
  });
});
