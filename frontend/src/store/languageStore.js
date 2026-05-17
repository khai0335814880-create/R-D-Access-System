import { useTranslation } from 'react-i18next';

export const normalizeLanguage = (language) => {
  if (!language) return 'en';
  return language.toLowerCase().startsWith('vi') ? 'vi' : 'en';
};

const legacyKeyMap = {
  active_in_room: 'common.active_in_room',
  back: 'common.back',
  cancel: 'common.cancel',
  close: 'common.close',
  dashboard: 'common.dashboard',
  devices: 'common.devices',
  in_room: 'common.in_room',
  inventory: 'common.inventory',
  loading: 'common.loading',
  profile: 'common.profile',
  rules: 'common.rules',
  search: 'common.search',
  settings: 'common.settings',
  sign_out: 'common.sign_out',
  support: 'common.support',
};

export const useLanguageStore = () => {
  const { t: translate, i18n } = useTranslation();
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  const setLanguage = (lang) => {
    const normalized = normalizeLanguage(lang);
    localStorage.setItem('language', normalized);
    i18n.changeLanguage(normalized);
  };

  const t = (key, options) => {
    const mappedKey = legacyKeyMap[key] || key;
    const value = translate(mappedKey, options);

    if (value && typeof value === 'object') {
      return key;
    }

    return value;
  };

  return { language, setLanguage, t };
};
