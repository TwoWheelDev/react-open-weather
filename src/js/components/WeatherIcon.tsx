import React from 'react';
import styled from '@emotion/styled';

export interface WeatherIconProps {
  path: string;
  title: string;
  viewBox?: string;
  color?: string;
  size?: number;
}

const StyledSVG = styled.svg`
  fill: ${({ color }) => color};
`;

function WeatherIcon({
  title,
  path,
  size = 40,
  viewBox = '0 -5 35 40',
  color = '#4BC4F7',
}: WeatherIconProps) {
  return (
    <StyledSVG
      color={color}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
    >
      <title>{title}</title>
      <path d={path} />
    </StyledSVG>
  );
}

export default WeatherIcon;
