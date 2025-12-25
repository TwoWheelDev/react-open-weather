import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import WeatherIcon from '../src/js/components/WeatherIcon';

describe('WeatherIcon', () => {
  test('render WeatherIcon', () => {
    const { container } = render(
      <WeatherIcon
        path="svg path here"
        size={120}
        color="white"
        title="icon description"
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
