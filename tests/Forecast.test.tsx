import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import Forecast from '../src/js/components/Forecast';
import { mappedForecast } from './fixtures/openweather/forecast';
import defaultTheme from '../src/js/defaultTheme';

describe('Forecast', () => {
  test('should render the Forecast component', () => {
    const labels = {
      temperature: 'F',
      windSpeed: 'km/h',
    };

    const { container } = render(
      <Forecast
        unitsLabels={labels}
        forecast={mappedForecast}
        theme={defaultTheme}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
