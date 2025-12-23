import React from 'react';
import { getLabelsByLanguage } from '../utils';
import { StyledtodayPanel } from './Today.styles';
import defaultTheme from '../defaultTheme';
import { UnitsLabels } from '../models/unitsLabels';
import { LanguageCode } from '../lang';

export interface CurrentData {
  date: string|number
  description: string
  icon: string
  temperature: { current: string|number, min: string|number, max: string|number }
  wind: string|number
  humidity: string|number
}

export interface TodayProps {
  current: CurrentData
  unitsLabels: UnitsLabels
  lang: LanguageCode
  theme?: typeof defaultTheme
}

const Today: React.FC<TodayProps> = ({ current, unitsLabels, lang, theme }) => {
  const labels = getLabelsByLanguage(lang);
  const hasRange =
    current.temperature.min !== undefined &&
    current.temperature.max !== undefined;
  return (
    <StyledtodayPanel className="rw-today" theme={theme}>
      <div className="rw-today-date">{current.date}</div>
      <div className="rw-today-hr" />
      <div className="rw-today-current">
        {current.temperature.current} {unitsLabels.temperature}
      </div>
      {hasRange && (
        <div className="rw-today-range">
          {current.temperature.max} / {current.temperature.min}{' '}
          {unitsLabels.temperature}
        </div>
      )}
      <div className="rw-today-desc">{current.description}</div>
      <div className="rw-today-hr" />
      <div className="rw-today-info">
        <div>
          {labels.wind}: <b>{current.wind}</b> {unitsLabels.windSpeed}
        </div>
        <div>
          {labels.humidity}: <b>{current.humidity}</b> %
        </div>
      </div>
    </StyledtodayPanel>
  );
};

export default Today;
