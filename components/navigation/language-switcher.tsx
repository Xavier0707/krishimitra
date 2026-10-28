'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-cream-200 p-1 rounded-lg border border-charcoal-200">
      <Globe className="w-3.5 h-3.5 text-charcoal-500 ml-1.5 hidden sm:inline-block" />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
              isActive
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-300'
            }`}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.nativeLabel}
          </button>
        );
      })}
    </div>
  );
}
