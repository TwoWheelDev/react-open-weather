/* eslint-disable prettier/prettier */
import svgIcons from '../../svgIcons';

const iconsMap = {
  'snow': svgIcons.snow,
  'snow-showers-day': svgIcons.snow,
  'snow-showers-night': svgIcons.snow,
  'thunder-rain': svgIcons.thunderstorms,
  'thunder-showers-day': svgIcons.stormyShowers,
  'thunder-showers-night': svgIcons.stormyShowers,
  'rain': svgIcons.rain,
  'showers-day': svgIcons.sprinkle,
  'showers-night': svgIcons.sprinkle,
  'fog': svgIcons.fog,
  'wind': svgIcons.sunny,
  'cloudy': svgIcons.cloudy,
  'partly-cloudy-day': svgIcons.cloudy,
  'partly-cloudy-night': svgIcons.cloudy,
  'clear-day': svgIcons.sunny,
  'clear-night': svgIcons.sunny,
};

export type WeatherCode = keyof typeof iconsMap;

export const getIcon = (name: string | WeatherCode) => {
  if (name in iconsMap) {
    return iconsMap[name as WeatherCode];
  }
  return svgIcons.sunny;
};
