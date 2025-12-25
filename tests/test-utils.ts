/* eslint-disable import/no-extraneous-dependencies */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

export const checkSnapshot = (component: React.ReactElement) => {
  const { container } = render(component);
  expect(container).toMatchSnapshot();
};
