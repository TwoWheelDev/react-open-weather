import { WeatherData } from '../src/js';
import { mappedCurrent } from './fixtures/openmeteo/current';
import { mappedForecast } from './fixtures/openmeteo/forecast';
import {
  fetchReducer,
  SUCCESS,
  FAILURE,
} from '../src/js/providers/provider_utils';

describe('Test the fetchReducer', () => {
  test('fetchReducer handles SUCCESS', () => {
    const initialState = {
      data: null,
      errorMessage: 'previous error',
    };

    const payload: WeatherData = {
      current: mappedCurrent,
      forecast: mappedForecast,
    };

    const newState = fetchReducer(initialState, {
      type: SUCCESS,
      payload,
    });

    expect(newState).toEqual({
      data: payload,
      errorMessage: null,
    });
  });

  test('fetchReducer handles FAILURE', () => {
    const initialState = {
      data: {
        current: mappedCurrent,
        forecast: mappedForecast,
      },
      errorMessage: null,
    };

    const errorMessage = 'Network error';

    const newState = fetchReducer(initialState, {
      type: FAILURE,
      payload: errorMessage,
    });

    expect(newState).toEqual({
      data: null,
      errorMessage,
    });
  });

  test('fetchReducer does not mutate state', () => {
    const initialState = {
      data: null,
      errorMessage: null,
    };

    const payload: WeatherData = {
      current: mappedCurrent,
      forecast: mappedForecast,
    };

    const newState = fetchReducer(initialState, {
      type: SUCCESS,
      payload,
    });

    expect(newState).not.toBe(initialState);
  });
});
