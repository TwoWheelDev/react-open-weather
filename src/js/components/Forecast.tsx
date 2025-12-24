import React from 'react';
import WeatherIcon from './WeatherIcon';
import { StyledDaysPanel } from './Forecast.styles';
import { UnitsLabels } from '../models/unitsLabels';
import defaultTheme from '../defaultTheme';

export interface ForecastData {
  date: string;
  description: string;
  icon: string;
  temperature: { min: string; max: string };
  wind: string;
  humidity: number;
}

export interface ForecastProps {
  unitsLabels: UnitsLabels;
  forecast: Array<ForecastData>;
  theme: typeof defaultTheme;
}

function Forecast({ unitsLabels, forecast, theme }: ForecastProps) {
  return (
    <StyledDaysPanel className="rw-forecast-days-panel" theme={theme}>
      {forecast.map((day, i) => {
        if (i > 0) {
          return (
            <div key={day.date} className="rw-forecast-day">
              <div className="rw-forecast-date">{day.date}</div>
              <div className="rw-forecast-icon">
                <WeatherIcon
                  path={day.icon}
                  title={day.description}
                  color={theme.forecastIconColor}
                />
              </div>
              <div className="rw-forecast-desc">{day.description}</div>
              <div className="rw-forecast-range">
                {day.temperature.max} / {day.temperature.min}{' '}
                {unitsLabels.temperature}
              </div>
            </div>
          );
        }
        return '';
      })}
    </StyledDaysPanel>
  );
}

export default Forecast;
