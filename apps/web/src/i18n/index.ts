import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sk from './locales/sk.json';

export const languageStorageKey = 'wedding-planner-language';
export const supportedLanguages = ['en', 'sk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const getLocale = (language = i18n.language) => (language === 'sk' ? 'sk-SK' : 'en-GB');

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sk: { translation: sk } },
  lng: localStorage.getItem(languageStorageKey) || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.on('languageChanged', (language) => localStorage.setItem(languageStorageKey, language));

export default i18n;
