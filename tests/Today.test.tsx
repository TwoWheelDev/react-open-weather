/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { render } from '@testing-library/react';
import Today from '../src/js/components/Today';
import { mappedCurrent as current } from './fixtures/openweather/current';
import defaultTheme from '../src/js/defaultTheme';

describe('Forecast', () => {
  test('should render the Forecast component', () => {
    const labels = {
      temperature: 'F',
      windSpeed: 'km/h',
    };

    const { container } = render(
      <Today
        current={current}
        unitsLabels={labels}
        lang="en"
        theme={defaultTheme}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
