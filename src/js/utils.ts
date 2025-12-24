import { langText, LanguageCode } from './lang';

export const getLabelsByLanguage = (lang: LanguageCode) => {
  return langText[lang] === undefined ? langText.en : langText[lang];
};
