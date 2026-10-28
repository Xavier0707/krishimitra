'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './language-switcher';
import { Menu, X, Bell, WifiOff, MapPin, Sprout, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/badge';

interface TopbarProps {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

export function Topbar({ onToggleMobileNav, isMobileNavOpen }: TopbarProps) {
  const pathname = usePathname();
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

  // Determine current page title
  const getPageTitle = () => {
    if (pathname.includes('/mandi')) return t.nav.mandi;
    if (pathname.includes('/weather')) return t.nav.weather;
    if (pathname.includes('/crop-doctor')) return t.nav.cropDoctor;
    if (pathname.includes('/farm-twin')) return t.nav.farmTwin;
    if (pathname.includes('/soil')) return t.nav.soil;
    if (pathname.includes('/copilot')) return t.nav.copilot;
    if (pathname.includes('/storage-planner')) return t.nav.storagePlanner;
    if (pathname.includes('/profile')) return t.nav.profile;
    return t.nav.dashboard;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE9DD] px-4 sm:px-6 py-3 flex items-center justify-between shadow-soft">
      {/* Mobile brand & toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="p-2 lg:hidden text-[#10312B] hover:bg-[#EAF4E8] rounded-xl transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-[#1F4A3F] text-[#DBF2DE] flex items-center justify-center shadow-soft">
            <Sprout className="w-5 h-5 text-[#DBF2DE]" />
          </div>
          <span className="font-extrabold text-sm text-[#10312B]">KrishiConnect</span>
        </Link>

        {/* Desktop Breadcrumbs */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#52685B]">
          <Link href="/dashboard" className="hover:text-[#10312B] font-medium transition-colors">
            {t.brand.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#718579]" />
          <span className="font-bold text-[#10312B]">{getPageTitle()}</span>
        </div>

        {/* Location Context Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#EAF4E8] rounded-xl border border-[#DCE9DD] text-xs font-medium text-[#10312B]">
          <MapPin className="w-3.5 h-3.5 text-[#1F4A3F]" />
          <span>सीहोर (Sehore), मध्य प्रदेश</span>
          <span className="text-[#9EC2A9]">•</span>
          <span className="text-[#52685B] font-medium">काली मिट्टी</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isOnline && (
          <Badge variant="warning" size="sm" className="gap-1 animate-pulse">
            <WifiOff className="w-3 h-3" />
            <span>ऑफ़लाइन</span>
          </Badge>
        )}

        <LanguageSwitcher />

        {/* Notifications Icon */}
        <Link
          href="/dashboard"
          className="p-2 text-[#52685B] hover:text-[#10312B] hover:bg-[#EAF4E8] rounded-xl relative transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1F4A3F]" />
        </Link>
      </div>
    </header>
  );
}
