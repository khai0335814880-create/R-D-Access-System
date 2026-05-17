import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

const addLegacyFlatKeys = (translations) => {
  const result = { ...translations };

  Object.values(translations).forEach((group) => {
    if (!group || typeof group !== 'object' || Array.isArray(group)) return;

    Object.entries(group).forEach(([key, value]) => {
      if (typeof value === 'string' && result[key] === undefined) {
        result[key] = value;
      }
    });
  });

  return result;
};

const resources = {
  en: {
    translation: addLegacyFlatKeys(enTranslations)
  },
  vi: {
    translation: addLegacyFlatKeys(viTranslations)
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi'],
    nonExplicitSupportedLngs: true,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    }
  });

export default i18n;
