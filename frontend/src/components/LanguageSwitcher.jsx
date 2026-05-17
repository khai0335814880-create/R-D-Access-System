import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { normalizeLanguage } from '../store/languageStore';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    localStorage.setItem('language', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-primary/5 transition-all text-graphite hover:text-primary text-sm font-bold border border-fog hover:border-primary/20 bg-white/50 backdrop-blur-sm shadow-sm"
      title={language === 'en' ? 'Đổi sang tiếng Việt' : 'Switch to English'}
      aria-label={language === 'en' ? 'Đổi sang tiếng Việt' : 'Switch to English'}
    >
      <Globe size={16} />
      <span>
        {language === 'en' ? 'VI' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
