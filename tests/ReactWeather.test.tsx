import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import ReactWeather from '../src/js/components/ReactWeather';
import { mappedForecast as forecast } from './fixtures/openweather/forecast';
import { mappedCurrent as current } from './fixtures/openweather/current';

describe('ReactWeather', () => {
  test('should render the loader when isLoading is true ', () => {
    const { container } = render(
      <ReactWeather
        data={null}
        lang="en"
        unitsLabels={{ temperature: 'C', windSpeed: 'Km/h' }}
        errorMessage={null}
        showForecast
        isLoading
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('should render the errormessage when provided with one', () => {
    const { container } = render(
      <ReactWeather
        data={null}
        errorMessage="error occurred"
        isLoading={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('should render null when no data is provided', () => {
    const { container } = render(
      <ReactWeather data={null} errorMessage={null} isLoading={false} />,
    );

    expect(container).toMatchSnapshot();
  });

  test('should render the ReactWeather component', () => {
    const data = { forecast, current };
    const { container } = render(
      <ReactWeather
        data={data}
        lang="en"
        locationLabel="Munich"
        unitsLabels={{ temperature: 'C', windSpeed: 'Km/h' }}
        errorMessage={null}
        showForecast
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
