'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  TrendingUp,
  CloudSun,
  Stethoscope,
  Map,
  FlaskConical,
  Bot,
  Warehouse,
  User,
  X,
  Sprout,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/dashboard/mandi', label: t.nav.mandi, icon: TrendingUp },
    { href: '/dashboard/weather', label: t.nav.weather, icon: CloudSun },
    { href: '/dashboard/crop-doctor', label: t.nav.cropDoctor, icon: Stethoscope },
    { href: '/dashboard/farm-twin', label: t.nav.farmTwin, icon: Map },
    { href: '/dashboard/soil', label: t.nav.soil, icon: FlaskConical },
    { href: '/dashboard/copilot', label: t.nav.copilot, icon: Bot },
    { href: '/dashboard/storage-planner', label: t.nav.storagePlanner, icon: Warehouse },
    { href: '/dashboard/profile', label: t.nav.profile, icon: User },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-forest-900 text-white flex flex-col shadow-2xl z-10 animate-slideRight">
        <div className="p-4 border-b border-forest-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-agri-400" />
            <span className="font-extrabold text-base">KrishiConnect AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-forest-300 hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-800 text-white font-semibold'
                    : 'text-forest-200 hover:bg-forest-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-agri-400' : 'text-forest-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-forest-800 bg-forest-950/50">
          <p className="text-xs font-semibold text-white">रामेश पटेल</p>
          <p className="text-[11px] text-forest-300">सीहोर, म.प्र. (डेमो मोड)</p>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/dashboard/mandi', label: t.nav.mandi, icon: TrendingUp },
    { href: '/dashboard/weather', label: t.nav.weather, icon: CloudSun },
    { href: '/dashboard/copilot', label: t.nav.copilot, icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur border-t border-charcoal-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-forest-800 font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-0.5 ${
                isActive ? 'text-forest-800 scale-110' : 'text-charcoal-500'
              }`}
            />
            <span className="truncate max-w-[64px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
