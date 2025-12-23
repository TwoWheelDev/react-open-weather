import '@emotion/react'

declare module '@emotion/react' {
  export interface Theme {
    fontFamily: string,
    gradientStart: string
    gradientMid: string
    gradientEnd: string
    locationFontColor: string
    todayTempFontColor: string
    todayDateFontColor: string
    todayRangeFontColor: string
    todayDescFontColor: string
    todayInfoFontColor: string
    todayIconColor: string
    forecastBackgroundColor: string
    forecastSeparatorColor: string
    forecastDateColor: string
    forecastDescColor: string
    forecastRangeColor: string
    forecastIconColor: string
    containerDropShadow: string
  }
}