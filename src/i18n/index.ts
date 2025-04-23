import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR';
import enUS from './locales/en-US';
import es from './locales/es';

const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const resources: Record<SupportedLanguage, any> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es': es
};

const getBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language;
  
  if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  
  const shortLang = browserLang.split('-')[0];
  
  if (shortLang === 'en') return 'en-US';
  if (shortLang === 'es') return 'es';
  
  return 'pt-BR';
};

const savedLanguage = localStorage.getItem('language') as SupportedLanguage | null;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || getBrowserLanguage(),
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 