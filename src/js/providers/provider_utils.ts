import { WeatherData } from '../components/ReactWeather';

export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';

export interface FetchState {
  data: WeatherData | null;
  errorMessage: string | null;
}

export type FetchAction =
  | { type: typeof SUCCESS; payload: WeatherData }
  | { type: typeof FAILURE; payload: string };

export const fetchReducer = (
  state: FetchState,
  action: FetchAction,
): FetchState => {
  switch (action.type) {
    case SUCCESS:
      return {
        data: action.payload,
        errorMessage: null,
      };
    case FAILURE:
      return {
        data: null,
        errorMessage: action.payload,
      };
    default:
      return state;
  }
};
