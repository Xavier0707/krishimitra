'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './language-switcher';
import { Menu, X, Bell, WifiOff, MapPin, Sprout } from 'lucide-react';
import { Badge } from '../ui/badge';

interface TopbarProps {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

export function Topbar({ onToggleMobileNav, isMobileNavOpen }: TopbarProps) {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-charcoal-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Mobile brand & toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="p-2 lg:hidden text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-agri-400 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-forest-900">KrishiConnect</span>
        </Link>

        {/* Location pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-cream-200 rounded-full border border-charcoal-200 text-xs font-medium text-charcoal-800">
          <MapPin className="w-3.5 h-3.5 text-forest-700" />
          <span>सीहोर (Sehore), मध्य प्रदेश</span>
          <span className="text-charcoal-400">•</span>
          <span className="text-forest-700 font-semibold">काली मिट्टी (Black Soil)</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isOnline && (
          <Badge variant="warning" size="sm" className="gap-1 animate-pulse">
            <WifiOff className="w-3 h-3" />
            <span>ऑफलाइन</span>
          </Badge>
        )}

        <LanguageSwitcher />

        {/* Notifications Icon */}
        <Link
          href="/dashboard"
          className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 rounded-lg relative transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-agri-600" />
        </Link>
      </div>
    </header>
  );
}
