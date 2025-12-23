import React from 'react';
import Today, { CurrentData } from './Today';
import Forecast, { ForecastData } from './Forecast';
import WeatherIcon from './WeatherIcon';
import { StyledContainer } from './ReactWeather.styles';
import defaultTheme from '../defaultTheme';
import { UnitsLabels } from '../models/unitsLabels';
import { LanguageCode } from '../lang';

export interface WeatherData {
  forecast: Array<ForecastData>
  current: CurrentData
}

export interface ReactWeatherProps {
  unitsLabels?: UnitsLabels
  showForecast?: boolean
  lang?: LanguageCode
  data: WeatherData|null
  locationLabel?: string
  isLoading?: boolean
  errorMessage: string|null
  theme?: typeof defaultTheme
}

const ReactWeather: React.FC<ReactWeatherProps> = ({
  unitsLabels = { temperature: 'C', windSpeed: 'Km/h' },
  showForecast = true,
  lang = 'en',
  data = null,
  locationLabel = '',
  isLoading = false,
  errorMessage = null,
  theme = defaultTheme,
}) => {
  if (data) {
    const { forecast, current } = data;
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (errorMessage) {
      return <div>{errorMessage}</div>;
    }
    return (
      <StyledContainer className="rw-container" theme={theme}>
        <div className="rw-container-main">
          <div className="rw-container-left">
            <h2 className="rw-container-header">{locationLabel}</h2>
            <Today
              current={current}
              unitsLabels={unitsLabels}
              lang={lang}
              theme={theme}
            />
          </div>
          <div className="rw-container-right">
            <WeatherIcon
              path={current.icon}
              size={120}
              color={theme.todayIconColor}
              title={current.description}
            />
          </div>
        </div>
        {showForecast && (
          <Forecast
            unitsLabels={unitsLabels}
            forecast={forecast}
            theme={theme}
          />
        )}
      </StyledContainer>
    );
  }
  return null;
};

export default ReactWeather;
