import { langText, LanguageCode } from './lang';

export const getLabelsByLanguage = (lang: LanguageCode | null) => {
  if (lang != null) {
    return langText[lang] === undefined ? langText.en : langText[lang];
  }
  return langText.en;
};
