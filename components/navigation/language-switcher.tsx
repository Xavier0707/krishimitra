'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-[#EAF4E8] p-1 rounded-xl border border-[#DCE9DD]">
      <Globe className="w-3.5 h-3.5 text-[#52685B] ml-1.5 hidden sm:inline-block" />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
              isActive
                ? 'bg-[#1F4A3F] text-white shadow-soft'
                : 'text-[#52685B] hover:text-[#10312B] hover:bg-[#DBF2DE]/60'
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
