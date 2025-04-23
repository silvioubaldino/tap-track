import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Usando a mesma definição de idiomas suportados
const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es'] as const;
type Language = typeof SUPPORTED_LANGUAGES[number];

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
];

const LanguageSelector = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { i18n } = useTranslation();
  
  const getCurrentLanguage = (): LanguageOption => {
    const currentCode = i18n.language as Language;
    return languages.find(lang => lang.code === currentCode) || languages[0];
  };
  
  const changeLanguage = (code: Language) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setDropdownOpen(false);
  };
  
  const current = getCurrentLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 rounded-md flex items-center hover:bg-opacity-80 transition-all"
        aria-label="Selecionar idioma"
      >
        <span className="mr-1">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.label}</span>
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <span className="mr-2">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 