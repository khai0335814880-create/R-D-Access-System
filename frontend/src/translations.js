import en from './locales/en.json';
import vi from './locales/vi.json';

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

const translations = {
  en: addLegacyFlatKeys(en),
  vi: addLegacyFlatKeys(vi),
};

export default translations;
