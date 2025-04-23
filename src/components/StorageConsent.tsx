import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface StorageConsentProps {
  onAccept: () => void;
}

const STORAGE_CONSENT_KEY = 'storage-consent-accepted';

export function StorageConsent({ onAccept }: StorageConsentProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(STORAGE_CONSENT_KEY);
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_CONSENT_KEY, 'true');
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 md:p-6 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>
            {t('consent.message')}{' '}
            <a
              href="/docs/LEGAL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              {t('consent.learnMore')}
            </a>
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
} 